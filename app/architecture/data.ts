export const ARCH_DECISIONS = [
  {
    label: "Concurrency block",
    detail: "Client-side ref blocks re-submission while a job is in flight — prevents duplicate HeyGen sessions from a double-click or fast re-submit.",
  },
  {
    label: "60-min timeout",
    detail: "MAX_POLLS ceiling · relies on HeyGen's own failed signal, not a timer",
  },
  {
    label: "Failure handling",
    detail: "HeyGen failed: surfaced to UI, user re-submits. 429: Retry-After returned to client with live countdown. Transient errors: 3 retries before error banner.",
  },
  {
    label: "Cost tracking",
    detail: "Each video captures credit cost and render duration from the HeyGen API response, displayed per-video in the portal.",
  },
];

export const TIER1_DECISIONS = [
  {
    label: "Helios IdP (SAML / OIDC)",
    detail: "Org-scoped sessions tied to Helios's identity provider; HeyGen API key stays server-side only",
  },
  {
    label: "Postgres (self-hosted)",
    detail: "orgs · users · briefs · jobs schema; row-level security by org_id; status tracked in DB",
  },
  {
    label: "Webhook + auto-push",
    detail: "HeyGen POSTs to /api/webhook on completion; HMAC-SHA256 verified; MP4 written directly to On-Premise Blob — no manual download",
  },
  {
    label: "Idempotency",
    detail: "Every job gets a deterministic key = hash(brief_id + role + language). Worker checks Postgres before calling HeyGen — prevents duplicate renders on queue retry.",
  },
  {
    label: "Security",
    detail: "HeyGen API key: Vercel env var only — never in browser. Webhook: HMAC-SHA256 verified before processing. Blob: private by default, pre-signed URLs. All data scoped by org_id (row-level security).",
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


export const TECH_TABLE = [
  { concern: "Framework",       t0: "Next.js + Vercel",       t1: "App server (self-hosted)",  t2: "--" },
  { concern: "AI / Script",     t0: "HeyGen Video Agent",     t1: "--",                        t2: "--" },
  { concern: "Auth",            t0: "None",                   t1: "SAML / OIDC (Helios IdP)",  t2: "--" },
  { concern: "Job queue",       t0: "None (sync poll)",       t1: "None (webhook)",             t2: "Internal queue (retry + DLQ)" },
  { concern: "Metadata DB",     t0: "Redis (briefs only)",    t1: "Postgres (self-hosted)",     t2: "--" },
  { concern: "Video storage",   t0: "HeyGen CDN URL",         t1: "On-Premise Blob",            t2: "← same + CDN" },
  { concern: "Brief source",    t0: "Manual form",            t1: "Manual form",                t2: "Form + doc upload / internal search" },
  { concern: "Video delivery",  t0: "Manual download",        t1: "Auto-push (webhook)",        t2: "Enablement Tool (auto-publish)" },
  { concern: "Monitoring",      t0: "Vercel Analytics",       t1: "On-prem tools",              t2: "--" },
  { concern: "Status delivery", t0: "REST polling (4s)",      t1: "SSE + webhook",              t2: "SSE + queue events" },
];
