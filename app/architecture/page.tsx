"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const, delay: i * 0.07 },
  }),
};

// ---------------------------------------------------------------------------
// Tier 0 SVG diagram
// ---------------------------------------------------------------------------

function Tier0Diagram() {
  const stroke  = "#e2e8f0";
  const arrow   = "#94a3b8";
  const label   = "#64748b";
  const heading = "#0f172a";

  // Node geometry
  // Browser:   x=20,  y=28, w=128, h=56  → right-mid (148,50)  bottom-mid (84,84)
  // Next.js:   x=286, y=28, w=168, h=56  → left-mid  (286,50)  right-mid (454,50)  bottom (370,84)
  // HeyGen:    x=566, y=28, w=150, h=56  → left-mid  (566,50)  bottom-mid (641,84)
  // Redis:     x=166, y=212, w=152, h=56 → top-mid   (242,212)
  // On-Prem:   x=406, y=212, w=196, h=56 → top-mid   (504,212)

  return (
    <svg
      viewBox="0 0 740 292"
      width="100%"
      style={{ fontFamily: "inherit", overflow: "visible" }}
    >
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill={arrow} />
        </marker>
        <filter id="ns" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodOpacity="0.07" />
        </filter>
      </defs>

      {/* ── Nodes ─────────────────────────────────────────────────────────── */}

      {/* Browser */}
      <g filter="url(#ns)">
        <rect x="20" y="28" width="128" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="84" y="53" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Browser</text>
      <text x="84" y="70" textAnchor="middle" fontSize="10" fill={label}>Client</text>

      {/* Next.js / Vercel */}
      <g filter="url(#ns)">
        <rect x="286" y="28" width="168" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="370" y="53" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Next.js / Vercel</text>
      <text x="370" y="70" textAnchor="middle" fontSize="10" fill={label}>Integration layer</text>

      {/* HeyGen */}
      <g filter="url(#ns)">
        <rect x="566" y="28" width="150" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="641" y="53" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>HeyGen</text>
      <text x="641" y="70" textAnchor="middle" fontSize="10" fill={label}>Video Agent API v3</text>

      {/* Redis */}
      <g filter="url(#ns)">
        <rect x="166" y="212" width="152" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="242" y="237" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Redis</text>
      <text x="242" y="254" textAnchor="middle" fontSize="10" fill={label}>helios:briefs</text>

      {/* On-Premise Storage */}
      <g filter="url(#ns)">
        <rect x="406" y="212" width="196" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="504" y="237" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>On-Premise Storage</text>
      <text x="504" y="254" textAnchor="middle" fontSize="10" fill={label}>presigned PUT</text>

      {/* ── Arrows ────────────────────────────────────────────────────────── */}

      {/* 1 · Browser → Next.js  (forward, top) */}
      <line x1="148" y1="50" x2="286" y2="50"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr)" />
      <rect x="162" y="33" width="110" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="217" y="45" textAnchor="middle" fontSize="9.5" fill={label}>Video Agent API v3</text>

      {/* 2 · Next.js → HeyGen  (forward) */}
      <line x1="454" y1="50" x2="566" y2="50"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr)" />
      <rect x="460" y="33" width="106" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="513" y="45" textAnchor="middle" fontSize="9.5" fill={label}>POST /api/generate</text>

      {/* 3 · HeyGen → Next.js  (arc below — /api/status return seg 1) */}
      <path d="M 641,84 C 641,164 370,164 370,84"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
      {/* arc midpoint ≈ (505, 144) at t=0.5 */}
      <rect x="438" y="136" width="130" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="503" y="148" textAnchor="middle" fontSize="9.5" fill={label}>/api/status · 4s poll</text>

      {/* 4 · Next.js → Browser  (video_url, return seg 2 — offset below fwd) */}
      <line x1="286" y1="62" x2="148" y2="62"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr)" />
      <rect x="187" y="64" width="62" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="218" y="76" textAnchor="middle" fontSize="9.5" fill={label}>video_url</text>

      {/* 5 · Next.js → Redis  (elbow — left branch) */}
      <path d="M 334,84 L 334,184 L 242,184 L 242,212"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
      <rect x="252" y="175" width="72" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="288" y="187" textAnchor="middle" fontSize="9.5" fill={label}>helios:briefs</text>

      {/* 6 · Next.js → On-Premise  (elbow — right branch) */}
      <path d="M 406,84 L 406,184 L 504,184 L 504,212"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
      <rect x="416" y="175" width="92" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="462" y="187" textAnchor="middle" fontSize="9.5" fill={label}>/api/push-video</text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const ARCH_DECISIONS = [
  {
    label: "Rate limiting",
    detail: "Per-IP Redis TTL · 90s cooldown · 429 surfaced to client with countdown",
  },
  {
    label: "Concurrency block",
    detail: "submitting.current ref — ignores re-submit while a job is in flight",
  },
  {
    label: "60-min timeout",
    detail: "MAX_POLLS ceiling · relies on HeyGen's own failed signal, not a timer",
  },
];

const HIGHER_TIERS = [
  {
    id: "T1",
    label: "Tier 1",
    title: "Production",
    tagline: "Auth, job persistence, real monitoring, owned video storage.",
    badge: "bg-purple-50 text-purple-600",
    border: "border-purple-100",
    adds: [
      "Clerk SSO (SAML / OIDC / WorkOS)",
      "Neon Postgres — orgs, users, briefs, jobs",
      "Vercel Blob — owned MP4 storage",
      "Webhook HMAC-SHA256 verification",
      "SSE status stream (replaces polling)",
      "Vercel Log Drains → Datadog / Axiom",
    ],
    flow: ["Browser", "Clerk Auth", "/api/generate → Postgres", "HeyGen (callback_url)", "/api/webhook → Blob"],
    extra: "organizations · users · briefs · jobs",
  },
  {
    id: "T2",
    label: "Tier 2",
    title: "Scale",
    tagline: "Queue-based dispatch, multi-region CDN, full cost tracking.",
    badge: "bg-orange-50 text-orange-600",
    border: "border-orange-100",
    adds: [
      "Upstash QStash — HTTP pub-sub, retry + DLQ",
      "Cloudflare R2 + CDN — edge-cached video delivery",
      "Idempotency key per job: hash(brief_id + role + language)",
      "Dead letter queue + alert on failure spike",
      "Cost tracking per job (credit cost, render time)",
    ],
    flow: ["Browser", "/api/generate → QStash", "/api/workers/render", "HeyGen (callback_url)", "Webhook → R2 → SSE"],
    extra: "40 briefs × 3 roles × 6 languages × 4 quarters = 2,880 jobs/year · ~10× burst = 28,800/year peak",
  },
];

const CONCERNS = [
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
    body: "No public TTS preview endpoint in HeyGen API. Dashboard implies an internal route exists. Scale path: request TTS preview access from account team; proxy as GET /api/voice-preview?voice_id=...",
  },
];

const TECH_TABLE = [
  { concern: "Framework",       t0: "Next.js + Vercel",       t1: "← same",           t2: "← same (Edge)" },
  { concern: "AI / Script",     t0: "HeyGen Video Agent",     t1: "← same",           t2: "← same" },
  { concern: "Auth",            t0: "None",                   t1: "Clerk (SSO)",       t2: "Clerk + WorkOS" },
  { concern: "Job queue",       t0: "None (sync poll)",       t1: "None (webhook)",    t2: "Upstash QStash" },
  { concern: "Metadata DB",     t0: "Redis (briefs only)",    t1: "Neon Postgres",     t2: "← same" },
  { concern: "Video storage",   t0: "HeyGen CDN URL",         t1: "Vercel Blob",       t2: "Cloudflare R2" },
  { concern: "CDN",             t0: "HeyGen CDN",             t1: "Vercel CDN",        t2: "Cloudflare CDN" },
  { concern: "Monitoring",      t0: "Vercel Analytics",       t1: "+ Log Drains",      t2: "+ Datadog / Axiom" },
  { concern: "Status delivery", t0: "REST polling (4s)",      t1: "SSE + webhook",     t2: "SSE + queue events" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-xs font-semibold text-muted hover:text-foreground transition-colors flex items-center gap-1">
          ← Home
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-foreground tracking-tight">Helios</span>
          <span className="text-sm font-black text-blue tracking-tight">AI Studio</span>
          <span className="text-muted mx-1">·</span>
          <span className="text-sm font-semibold text-muted">Architecture</span>
        </div>
        <Link href="/portal" className="text-xs font-semibold bg-foreground text-white px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors">
          Open portal →
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-12">
          <span className="inline-flex items-center gap-2 bg-blue/10 text-blue text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue" />
            Three-tier design
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Architecture
          </h1>
          <p className="text-muted mt-3 max-w-xl leading-relaxed text-sm">
            Three tiers, each shippable independently. POC proves the pipeline. Production adds auth, persistence, and observability. Scale adds queue-based throughput and owned storage. Each tier is a superset of the previous — no rework, only additions.
          </p>
        </motion.div>

        {/* ── Tier 0 (special — contains diagram) ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="rounded-2xl border border-blue/20 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue/10 text-blue">Tier 0</span>
            <h2 className="text-lg font-black text-foreground tracking-tight">POC</h2>
          </div>
          <p className="text-sm text-muted mb-6">Brief in → video URL out, demo-ready.</p>

          {/* Diagram */}
          <div className="bg-gray-50/60 rounded-xl border border-border p-4 mb-6">
            <Tier0Diagram />
          </div>

          {/* Stack */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Stack</p>
            <ul className="space-y-1">
              {["HeyGen Video Agent API v3", "REST polling every 4s (session → video → URL)", "Redis rate limiting per IP (helios:cooldown:{ip})", "Brief persistence via Redis (helios:briefs)"].map((a) => (
                <li key={a} className="flex items-start gap-2 text-xs text-foreground leading-relaxed">
                  <span className="text-muted mt-0.5">–</span>{a}
                </li>
              ))}
            </ul>
          </div>

          {/* Arch decisions */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Arch decisions</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ARCH_DECISIONS.map((d) => (
                <div key={d.label} className="flex flex-col gap-1 p-3 bg-white rounded-xl border border-border">
                  <span className="text-xs font-semibold text-foreground">{d.label}</span>
                  <span className="text-xs text-muted leading-relaxed">{d.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted italic mt-5">
            Intentionally skips: auth, queuing, CDN, monitoring, owned storage.
          </p>
        </motion.div>

        {/* ── Tier 1 + 2 ── */}
        <div className="space-y-6">
          {HIGHER_TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              variants={fadeUp} initial="hidden" animate="show" custom={i + 2}
              className={`rounded-2xl border ${tier.border} p-6`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tier.badge}`}>{tier.label}</span>
                <h2 className="text-lg font-black text-foreground tracking-tight">{tier.title}</h2>
              </div>
              <p className="text-sm text-muted mb-5">{tier.tagline}</p>

              {/* Simple flow chain */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Data flow</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {tier.flow.map((step, si) => (
                    <span key={si} className="flex items-center gap-1.5">
                      <span className="text-xs bg-gray-100 text-foreground font-mono px-2 py-1 rounded-lg whitespace-nowrap">{step}</span>
                      {si < tier.flow.length - 1 && <span className="text-muted text-xs">→</span>}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Adds</p>
                <ul className="space-y-1">
                  {tier.adds.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-xs text-foreground leading-relaxed">
                      <span className="text-muted mt-0.5">–</span>{a}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-muted font-mono bg-gray-50 px-3 py-2 rounded-lg leading-relaxed">{tier.extra}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Cross-cutting concerns ── */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
          className="mt-16"
        >
          <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">Cross-cutting concerns</h2>
          <p className="text-sm text-muted mb-8">Applies across all tiers.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONCERNS.map((c, i) => (
              <motion.div
                key={c.title}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.4}
                className="flex flex-col gap-2 p-5 rounded-2xl border border-border"
              >
                <span className="text-sm font-semibold text-foreground">{c.title}</span>
                <p className="text-xs text-muted leading-relaxed">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Tech table ── */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
          className="mt-16"
        >
          <h2 className="text-2xl font-black text-foreground tracking-tight mb-6">Technology decisions</h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-muted w-36">Concern</th>
                  <th className="text-left px-4 py-3 font-semibold text-blue">Tier 0 — POC</th>
                  <th className="text-left px-4 py-3 font-semibold text-purple-600">Tier 1 — Production</th>
                  <th className="text-left px-4 py-3 font-semibold text-orange-600">Tier 2 — Scale</th>
                </tr>
              </thead>
              <tbody>
                {TECH_TABLE.map((row, i) => (
                  <tr key={row.concern} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-3 font-semibold text-foreground">{row.concern}</td>
                    <td className="px-4 py-3 text-muted">{row.t0}</td>
                    <td className="px-4 py-3 text-muted">{row.t1}</td>
                    <td className="px-4 py-3 text-muted">{row.t2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
