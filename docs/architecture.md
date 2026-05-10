# Architecture — HeyGen Video Generation Platform

## Design Philosophy

Three tiers, each shippable independently. POC proves the pipeline. Production adds auth, persistence, and observability. Scale adds queue-based throughput and owned storage. Each tier is a superset of the previous — no rework, only additions.

---

## Tier 0 — POC (what we build now)

**Goal:** Brief in → video URL out, demo-ready.

```
Browser
  └── Next.js (Vercel)
        ├── Form UI  →  API Route /api/generate
        │                 ├── Claude Haiku (brief → structured prompt, streaming)
        │                 └── HeyGen POST /v3/video-agents (job submit)
        └── SSE endpoint /api/status/[sessionId]
              └── polls HeyGen GET /v3/video-agents/{session_id}
                    └── on completed → video_url → browser plays MP4
```

**Stack:**
- **Framework:** Next.js App Router on Vercel
- **LLM:** Claude Haiku via Vercel AI SDK (`useChat` / `streamText`) — transforms the 6-section brief into a HeyGen-optimized prompt, adds role variant and language context
- **HeyGen:** direct REST calls from API routes (server-side, key never touches browser)
- **Status delivery:** Server-Sent Events from a polling API route — no WebSocket infra needed at this stage
- **Auth:** none in POC; HeyGen API key in Vercel env vars

**Data flow for script generation:**
```
Brief JSON  →  Haiku prompt:
  "You are writing a 60–90s sales enablement video script for a {role} seller.
   Language: {language}. Sections: [open, problem, product, differentiators,
   motion, close]. Return a single HeyGen-optimized prompt with scene direction."
  →  HeyGen prompt string  →  POST /v3/video-agents
```

**What we skip at this tier (intentional):**
- Auth, persistence, queuing, CDN, monitoring
- Multi-language (demonstrate one, describe five)

---

## Tier 1 — Production-Ready

**Adds:** authentication, job persistence, real monitoring, owned video storage.

```
Browser
  └── Next.js (Vercel)
        ├── Auth layer (Clerk)  ←→  Enterprise SSO (SAML/OIDC via Clerk/WorkOS)
        ├── Form UI
        └── API Routes
              ├── /api/generate
              │     ├── Haiku (streamText — script generation)
              │     ├── HeyGen POST /v3/video-agents
              │     └── Neon Postgres  ←  INSERT job row (status: pending)
              ├── /api/status/[jobId]
              │     ├── SELECT job from Postgres
              │     ├── if still pending: poll HeyGen, UPDATE status
              │     └── SSE stream to browser
              └── /api/webhook  (HeyGen callback_url)
                    ├── verify HMAC-SHA256
                    ├── UPDATE job row (status: completed, video_url)
                    └── download MP4 → Vercel Blob (owned storage)

Vercel Blob  →  serves video via Vercel CDN (edge-cached)
Neon Postgres  →  jobs, briefs, users, orgs tables
```

**Authentication — SSO model:**
- Users authenticate via Clerk (supports SAML, OIDC, Google, Microsoft)
- For enterprise customers (Helios): Clerk Organization SSO — Helios's IdP authenticates, Clerk issues session token
- HeyGen API key lives server-side in Vercel env vars — never per-user, always the platform key
- Multi-tenant future: per-org HeyGen API keys stored in Vercel env or a secrets manager (one key per customer account)

**Postgres schema (core tables):**
```sql
organizations (id, name, heygen_api_key_ref, created_at)
users         (id, org_id, email, role, clerk_user_id)
briefs        (id, org_id, user_id, sections jsonb, role_variant, language, created_at)
jobs          (id, brief_id, heygen_session_id, heygen_video_id, status,
               video_url, blob_url, duration_s, created_at, completed_at,
               failure_code, failure_message)
```

**Blob storage (S3-equivalent):**
- **Vercel Blob** for POC/small scale — dead simple, Vercel-native CDN
- Path convention: `/{org_id}/{job_id}/video.mp4`, `/{org_id}/{job_id}/thumbnail.jpg`
- Swap to **Cloudflare R2** or **AWS S3** at scale without changing the interface (pre-signed URL pattern stays the same)
- B-roll source assets also stored here: `/{org_id}/assets/{filename}`

**Monitoring:**
- Vercel Analytics + Speed Insights (built-in, zero config)
- Vercel Log Drains → Datadog or Axiom for structured log aggregation
- Custom metrics: job success rate, avg render time, HeyGen API error rate — emitted as structured logs, surfaced via Datadog dashboard
- Alert on: job failure spike, HeyGen 429s (rate limit signals), webhook delivery failures

---

## Tier 2 — Scale (pub-sub + CDN + full observability)

**Adds:** queue-based job dispatch, rate limit safety, multi-region video delivery, full cost tracking.

```
Browser
  └── Next.js (Vercel Edge)
        ├── Auth (Clerk / WorkOS)
        └── API Routes
              ├── /api/generate  →  enqueue job  →  Upstash QStash (pub-sub)
              │                                        └── delivers to /api/workers/render
              ├── /api/workers/render  (serverless function, queue consumer)
              │     ├── validate job, check idempotency key (Postgres)
              │     ├── call Haiku → structured prompt
              │     ├── POST HeyGen /v3/video-agents (with callback_url)
              │     └── UPDATE job status → queued_heygen
              ├── /api/webhook  (HeyGen → job completed)
              │     ├── verify HMAC-SHA256
              │     ├── download MP4 from HeyGen URL
              │     ├── upload → R2/S3 (unstructured store)
              │     ├── UPDATE Postgres (status: completed, blob_url, duration)
              │     └── publish completion event → QStash → notify browser
              └── /api/status/[jobId]  →  Postgres read  →  SSE

Upstash QStash  →  managed pub-sub, HTTP-based, retry + DLQ built-in
Cloudflare R2   →  unstructured store (videos, assets, B-roll)
  └── Cloudflare CDN  →  edge-cached video delivery globally
Neon Postgres   →  metadata, job history, cost tracking, audit log
```

**Queue design (writer nodes):**
- **QStash** (Upstash, Vercel Marketplace) — HTTP pub-sub, no persistent infra
- Each job enqueued with: `{ job_id, brief_id, priority, idempotency_key }`
- Rate limiting at queue level: configure max throughput to stay under HeyGen rate limits
- Dead letter queue: failed jobs after N retries → DLQ → alert + manual review
- "Writer nodes" = the `/api/workers/render` serverless functions — scale horizontally automatically with queue depth

**CDN strategy:**
- Videos served from Cloudflare CDN in front of R2 — edge-cached globally
- Cache-Control: `public, max-age=86400` (videos are immutable once rendered)
- Per-org signed URLs for private content (pre-signed R2 URLs, 1-hour TTL)
- Thumbnail/GIF served same path, cached aggressively

**Scaling math (from the challenge):**
```
40 briefs × 3 roles × 5 languages × 4 quarters = 2,400 jobs/year baseline
Product launches (burst): ~10x = 24,000 jobs/year peak
Daily average: ~7 jobs/day baseline, ~65/day at peak
```
QStash handles this with room to spare. HeyGen rate limits are the actual ceiling — this is why queuing with configurable throughput cap matters.

**Translation vs. generation strategy at scale:**
- Generate English master → POST `/v3/video-translate` (batch, 5 languages simultaneously)
- 1 generation job + 5 translation jobs vs. 5 generation jobs
- ~5x cheaper on HeyGen credits, faster overall (translation is faster than generation)

---

## Cross-Cutting Concerns

### Idempotency
- Every job has a deterministic `idempotency_key = hash(brief_id + role + language)`
- Worker checks Postgres before calling HeyGen — prevents duplicate renders on queue retry

### Failure handling
- HeyGen job failed: `failure_code` + `failure_message` stored, job marked `failed`, retry queued with backoff
- HeyGen 429: QStash retry with exponential backoff, throughput cap lowered automatically
- Webhook not received after 30 min: fallback polling job kicks in (cron every 5 min)

### Cost tracking
- Each job row captures: `heygen_credit_cost`, `haiku_token_count`, `haiku_cost_usd`
- Neon view: `monthly_cost_by_org` — surfaces in internal dashboard
- Alert if org exceeds budget threshold

### Security
- HeyGen API key: Vercel env var (never in code, never in browser)
- Webhook payloads: HMAC-SHA256 verified before processing
- Blob storage: private by default, pre-signed URLs only
- All org data scoped by `org_id` — row-level security in Postgres

---

## Technology Decisions Summary

| Concern | Tier 0 | Tier 1 | Tier 2 |
|---|---|---|---|
| Framework | Next.js + Vercel | ← same | ← same (Edge runtime) |
| LLM | Claude Haiku / Vercel AI SDK | ← same | ← same |
| Auth | none | Clerk (SSO) | Clerk + WorkOS |
| Job queue | none (sync) | none (webhook) | Upstash QStash |
| Metadata DB | none | Neon Postgres | ← same |
| Video storage | HeyGen URL | Vercel Blob | Cloudflare R2 |
| CDN | HeyGen CDN | Vercel CDN | Cloudflare CDN |
| Monitoring | Vercel Analytics | + Log Drains | + Datadog/Axiom |
| Status delivery | SSE polling | SSE + webhook | SSE + queue events |
