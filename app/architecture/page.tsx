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
// Data
// ---------------------------------------------------------------------------

const TIERS = [
  {
    id: "T0",
    label: "Tier 0",
    title: "POC",
    tagline: "Brief in → video URL out, demo-ready.",
    badge: "bg-blue/10 text-blue",
    border: "border-blue/20",
    adds: ["HeyGen Video Agent API v3", "REST polling every 4s (session → video → URL)", "Redis rate limiting per IP", "Brief persistence across refreshes"],
    flow: [
      { label: "Browser" },
      { label: "Next.js / Vercel" },
      { label: "/api/generate" },
      { label: "HeyGen v3/video-agents" },
      { label: "poll → video_url" },
    ],
    skips: "Auth, queuing, CDN, monitoring, owned storage.",
  },
  {
    id: "T1",
    label: "Tier 1",
    title: "Production",
    tagline: "Auth, job persistence, real monitoring, owned video storage.",
    badge: "bg-purple-50 text-purple-600",
    border: "border-purple-100",
    adds: ["Clerk SSO (SAML / OIDC / WorkOS)", "Neon Postgres — orgs, users, briefs, jobs", "Vercel Blob — owned MP4 storage", "Webhook HMAC-SHA256 verification", "SSE status stream (replaces polling)", "Vercel Log Drains → Datadog / Axiom"],
    flow: [
      { label: "Browser" },
      { label: "Clerk Auth" },
      { label: "/api/generate → Postgres" },
      { label: "HeyGen (callback_url)" },
      { label: "/api/webhook → Blob" },
    ],
    schema: "organizations · users · briefs · jobs",
  },
  {
    id: "T2",
    label: "Tier 2",
    title: "Scale",
    tagline: "Queue-based dispatch, multi-region CDN, full cost tracking.",
    badge: "bg-orange-50 text-orange-600",
    border: "border-orange-100",
    adds: ["Upstash QStash — HTTP pub-sub, retry + DLQ", "Cloudflare R2 + CDN — edge-cached video delivery", "Idempotency key per job (hash of brief + role + language)", "Dead letter queue + alert on failure spike", "Cost tracking per job (credit cost, render time)"],
    flow: [
      { label: "Browser" },
      { label: "/api/generate → QStash" },
      { label: "/api/workers/render" },
      { label: "HeyGen (callback_url)" },
      { label: "Webhook → R2 → SSE" },
    ],
    math: "40 briefs × 3 roles × 6 languages × 4 quarters = 2,880 jobs/year baseline · ~10× burst = 28,800/year peak",
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
  { concern: "Framework",       t0: "Next.js + Vercel",         t1: "← same",              t2: "← same (Edge)" },
  { concern: "AI / Script",     t0: "HeyGen Video Agent",       t1: "← same",              t2: "← same" },
  { concern: "Auth",            t0: "None",                     t1: "Clerk (SSO)",          t2: "Clerk + WorkOS" },
  { concern: "Job queue",       t0: "None (sync poll)",         t1: "None (webhook)",       t2: "Upstash QStash" },
  { concern: "Metadata DB",     t0: "Redis (briefs only)",      t1: "Neon Postgres",        t2: "← same" },
  { concern: "Video storage",   t0: "HeyGen CDN URL",           t1: "Vercel Blob",          t2: "Cloudflare R2" },
  { concern: "CDN",             t0: "HeyGen CDN",               t1: "Vercel CDN",           t2: "Cloudflare CDN" },
  { concern: "Monitoring",      t0: "Vercel Analytics",         t1: "+ Log Drains",         t2: "+ Datadog / Axiom" },
  { concern: "Status delivery", t0: "REST polling (4s)",        t1: "SSE + webhook",        t2: "SSE + queue events" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FlowChain({ steps }: { steps: { label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-3">
      {steps.map((s, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="text-xs bg-gray-100 text-foreground font-mono px-2 py-1 rounded-lg whitespace-nowrap">
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span className="text-muted text-xs">→</span>
          )}
        </span>
      ))}
    </div>
  );
}

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
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="mb-4"
        >
          <span className="inline-flex items-center gap-2 bg-blue/10 text-blue text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue" />
            Three-tier design
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Architecture
          </h1>
          <p className="text-muted mt-3 max-w-xl leading-relaxed">
            Three tiers, each shippable independently. POC proves the pipeline. Production adds auth, persistence, and observability. Scale adds queue-based throughput and owned storage. Each tier is a superset of the previous — no rework, only additions.
          </p>
        </motion.div>

        {/* Tiers */}
        <div className="mt-12 space-y-6">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              variants={fadeUp} initial="hidden" animate="show" custom={i + 1}
              className={`rounded-2xl border ${tier.border} p-6`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tier.badge}`}>
                      {tier.label}
                    </span>
                    <h2 className="text-lg font-black text-foreground tracking-tight">{tier.title}</h2>
                  </div>
                  <p className="text-sm text-muted">{tier.tagline}</p>
                </div>
              </div>

              {/* Data flow */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Data flow</p>
                <FlowChain steps={tier.flow} />
              </div>

              {/* Adds */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  {tier.id === "T0" ? "Stack" : "Adds"}
                </p>
                <ul className="space-y-1">
                  {tier.adds.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-xs text-foreground leading-relaxed">
                      <span className="text-muted mt-0.5">–</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Extra info */}
              {tier.skips && (
                <p className="text-xs text-muted italic">Intentionally skips: {tier.skips}</p>
              )}
              {tier.schema && (
                <p className="text-xs text-muted font-mono bg-gray-50 px-3 py-2 rounded-lg mt-2">
                  {tier.schema}
                </p>
              )}
              {tier.math && (
                <p className="text-xs text-muted font-mono bg-gray-50 px-3 py-2 rounded-lg mt-2 leading-relaxed">
                  {tier.math}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Cross-cutting concerns */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
          className="mt-16"
        >
          <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">Cross-cutting concerns</h2>
          <p className="text-sm text-muted mb-8">Applies across all tiers — not tier-specific.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONCERNS.map((c, i) => (
              <motion.div
                key={c.title}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.5}
                className="flex flex-col gap-2 p-5 rounded-2xl border border-border"
              >
                <span className="text-sm font-semibold text-foreground">{c.title}</span>
                <p className="text-xs text-muted leading-relaxed">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech table */}
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
