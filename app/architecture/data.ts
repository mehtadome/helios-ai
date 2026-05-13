export const ARCH_DECISIONS = [
  {
    label: "Concurrency block",
    detail: "submitting.current ref — ignores re-submit while a job is in flight",
  },
  {
    label: "60-min timeout",
    detail: "MAX_POLLS ceiling · relies on HeyGen's own failed signal, not a timer",
  },
];

export const TIER1_DECISIONS = [
  {
    label: "Helios IdP (SAML / OIDC)",
    detail: "org-scoped sessions tied to Helios's identity provider; HeyGen API key stays server-side only",
  },
  {
    label: "Postgres (self-hosted)",
    detail: "orgs · users · briefs · jobs schema; row-level security by org_id; status tracked in DB",
  },
  {
    label: "Webhook + auto-push",
    detail: "HeyGen POSTs to /api/webhook on completion; HMAC-SHA256 verified; MP4 written directly to On-Premise Blob — no manual download",
  },
];

export const TIER2_DECISIONS = [
  {
    label: "Job Queue (retry + DLQ)",
    detail: "async dispatch decouples submission from rendering; automatic retry on transient failure; dead letter queue alerts on spike",
  },
  {
    label: "Doc ingestion",
    detail: "PDF / slide deck parsed into the 6-section brief schema; knowledge base search auto-suggests content from internal docs",
  },
  {
    label: "Enablement Tool integration",
    detail: "video auto-published to seller's library (Highspot, Seismic, etc.) on webhook completion — no manual download step",
  },
];

export const CONCERNS = [
  {
    title: "Idempotency",
    body: "Every job gets a deterministic key = hash(brief_id + role + language). Worker checks Postgres before calling HeyGen — prevents duplicate renders on queue retry.",
  },
  {
    title: "Failure handling",
    body: "HeyGen failed: failure_code stored, retry queued with backoff. HeyGen 429: QStash exponential backoff, throughput cap auto-lowered. Webhook timeout: cron fallback polls every 5 min.",
  },
  {
    title: "Security",
    body: "HeyGen API key: Vercel env var only — never in browser. Webhook: HMAC-SHA256 verified before processing. Blob: private by default, pre-signed URLs. All data scoped by org_id (row-level security).",
  },
  {
    title: "Cost tracking",
    body: "Each job row captures heygen_credit_cost and render_time_s. Neon view: monthly_cost_by_org surfaced in internal dashboard. Alert on org budget threshold breach.",
  },
  {
    title: "Translation strategy",
    body: "Generate English master → POST /v3/video-translate for remaining languages in batch. 1 generation + N translations vs. N+1 generations — ~5× cheaper on HeyGen credits.",
  },
  {
    title: "Voice preview gap",
    body: "No public TTS preview endpoint in HeyGen API. Dashboard implies an internal route exists. Later: request TTS preview access from account team; proxy as GET /api/voice-preview?voice_id=...",
  },
];

export const TECH_TABLE = [
  { concern: "Framework",       t0: "Next.js + Vercel",       t1: "App server (self-hosted)",  t2: "← same" },
  { concern: "AI / Script",     t0: "HeyGen Video Agent",     t1: "← same",                   t2: "← same" },
  { concern: "Auth",            t0: "None",                   t1: "SAML / OIDC (Helios IdP)",  t2: "← same" },
  { concern: "Job queue",       t0: "None (sync poll)",       t1: "None (webhook)",             t2: "Internal queue (retry + DLQ)" },
  { concern: "Metadata DB",     t0: "Redis (briefs only)",    t1: "Postgres (self-hosted)",     t2: "← same" },
  { concern: "Video storage",   t0: "HeyGen CDN URL",         t1: "On-Premise Blob",            t2: "← same + CDN" },
  { concern: "Brief source",    t0: "Manual form",            t1: "Manual form",                t2: "Form + doc upload / search" },
  { concern: "Video delivery",  t0: "Manual download",        t1: "Auto-push (webhook)",        t2: "Enablement Tool (auto-publish)" },
  { concern: "Monitoring",      t0: "Vercel Analytics",       t1: "Datadog / Axiom",            t2: "← same + cost tracking" },
  { concern: "Status delivery", t0: "REST polling (4s)",      t1: "SSE + webhook",              t2: "SSE + queue events" },
];
