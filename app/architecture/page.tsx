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
// Tier 1 SVG diagram
// ---------------------------------------------------------------------------

function Tier1Diagram() {
  const stroke  = "#e2e8f0";
  const arrow   = "#94a3b8";
  const lbl     = "#64748b";
  const heading = "#0f172a";

  // Top row:
  //   Browser: x=20,  y=25, w=128, h=56  right=(148,47) bottom=(84,81)
  //   Next.js: x=220, y=25, w=168, h=56  left=(220,47) right=(388,47) x=232 for cache drop
  //   HeyGen:  x=530, y=25, w=148, h=56  bottom-left=(572,81) bottom-right=(624,81)
  //
  // Cache (Redis):  x=175, y=175, w=155, h=56  top-left=(232,175) top-right=(280,175) right=(330,203)
  //
  // On-Premise container (dashed):  x=388, y=148, w=344, h=108
  //   Postgres:     x=404, y=178, w=135, h=52
  //   Blob Storage: x=556, y=178, w=155, h=52

  return (
    <svg
      viewBox="0 0 760 278"
      width="100%"
      style={{ fontFamily: "inherit", overflow: "visible" }}
    >
      <defs>
        <marker id="arr1" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill={arrow} />
        </marker>
        <filter id="ns1" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodOpacity="0.07" />
        </filter>
      </defs>

      {/* ── Nodes ─────────────────────────────────────────────────────────── */}

      {/* Browser */}
      <g filter="url(#ns1)">
        <rect x="20" y="25" width="128" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="84" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Browser</text>
      <text x="84" y="67" textAnchor="middle" fontSize="10" fill={lbl}>Client</text>

      {/* Next.js / Vercel */}
      <g filter="url(#ns1)">
        <rect x="220" y="25" width="168" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="304" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Next.js / Vercel</text>
      <text x="304" y="67" textAnchor="middle" fontSize="10" fill={lbl}>Integration layer</text>

      {/* HeyGen */}
      <g filter="url(#ns1)">
        <rect x="530" y="25" width="148" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="604" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>HeyGen</text>
      <text x="604" y="67" textAnchor="middle" fontSize="10" fill={lbl}>Video Agent API v3</text>

      {/* Cache (Redis TTL) */}
      <g filter="url(#ns1)">
        <rect x="175" y="175" width="155" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="252" y="200" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Cache</text>
      <text x="252" y="217" textAnchor="middle" fontSize="10" fill={lbl}>Redis · TTL</text>

      {/* On-Premise container (dashed) */}
      <rect x="388" y="148" width="344" height="108" rx="12"
        fill="#f8fafc" stroke={stroke} strokeWidth="1.5" strokeDasharray="6 3" />
      <text x="560" y="168" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={arrow}
        letterSpacing="0.8">ON-PREMISE STORAGE</text>

      {/* Postgres (inside container) */}
      <g filter="url(#ns1)">
        <rect x="404" y="178" width="135" height="52" rx="8" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="471" y="202" textAnchor="middle" fontSize="11" fontWeight="700" fill={heading}>Postgres</text>
      <text x="471" y="218" textAnchor="middle" fontSize="10" fill={lbl}>metadata</text>

      {/* Blob Storage (inside container) */}
      <g filter="url(#ns1)">
        <rect x="556" y="178" width="155" height="52" rx="8" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="633" y="202" textAnchor="middle" fontSize="11" fontWeight="700" fill={heading}>Blob Storage</text>
      <text x="633" y="218" textAnchor="middle" fontSize="10" fill={lbl}>video files</text>

      {/* ── Arrows ────────────────────────────────────────────────────────── */}

      {/* 1a · Browser → Next.js  (no label) */}
      <line x1="148" y1="47" x2="220" y2="47"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />

      {/* 1b · Next.js → Browser  (no label, offset below) */}
      <line x1="220" y1="57" x2="148" y2="57"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />

      {/* 2 · Next.js → HeyGen  (no label) */}
      <line x1="388" y1="47" x2="530" y2="47"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />

      {/* 3 · HeyGen → Cache  (elbow: down then left to Cache top-right, label "TTL cache") */}
      <path d="M 572,81 L 572,138 L 280,138 L 280,175"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr1)" />
      <rect x="384" y="129" width="72" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="420" y="141" textAnchor="middle" fontSize="9.5" fill={lbl}>TTL cache</text>

      {/* 4 · HeyGen → On-Premise container  (straight down, label "auto-push") */}
      <line x1="624" y1="81" x2="624" y2="148"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />
      <rect x="630" y="106" width="70" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="665" y="118" textAnchor="middle" fontSize="9.5" fill={lbl}>auto-push</text>

      {/* 5 · Next.js → Cache  (straight down, no label) */}
      <line x1="232" y1="81" x2="232" y2="175"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />

      {/* 6 · Cache → Postgres  (horizontal into container, label "2nd hit miss") */}
      <line x1="330" y1="203" x2="404" y2="203"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />
      <rect x="330" y="193" width="82" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="371" y="205" textAnchor="middle" fontSize="9.5" fill={lbl}>2nd hit miss</text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Tier 2 SVG diagram
// ---------------------------------------------------------------------------

function Tier2Diagram() {
  const stroke  = "#e2e8f0";
  const arrow   = "#94a3b8";
  const lbl     = "#64748b";
  const heading = "#0f172a";

  // Top row:
  //   Browser:    x=20,  y=20, w=120, h=54  right=(140,43)  bottom=(80,74)
  //   App Server: x=230, y=20, w=160, h=54  left=(230,43)   right=(390,43)  bottom-left=(295,74)  bottom-right=(325,74)
  //   HeyGen:     x=580, y=20, w=148, h=54  left=(580,43)   bottom=(654,74)
  //
  // CMS (optional, dashed): x=20, y=100, w=120, h=52  right=(140,126)
  //
  // Job Queue: x=230, y=168, w=160, h=52  top-left=(295,168)  top-right=(325,168)
  //
  // On-Premise container (dashed): x=400, y=148, w=340, h=112
  //   Blob Storage: x=416, y=176, w=135, h=52  right=(551,202)  bottom=(483,228)
  //   Postgres:     x=568, y=176, w=155, h=52  left=(568,202)
  //
  // Enablement Tool: x=20, y=248, w=160, h=52  right=(180,274)

  return (
    <svg viewBox="0 0 760 310" width="100%" style={{ fontFamily: "inherit", overflow: "visible" }}>
      <defs>
        <marker id="arr2" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill={arrow} />
        </marker>
        <filter id="ns2" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodOpacity="0.07" />
        </filter>
      </defs>

      {/* ── Nodes ─────────────────────────────────────────────────────────── */}

      {/* Browser */}
      <g filter="url(#ns2)">
        <rect x="20" y="20" width="120" height="54" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="80" y="45" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Browser</text>
      <text x="80" y="62" textAnchor="middle" fontSize="10" fill={lbl}>Internal UI</text>

      {/* App Server */}
      <g filter="url(#ns2)">
        <rect x="230" y="20" width="160" height="54" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="310" y="45" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>App Server</text>
      <text x="310" y="62" textAnchor="middle" fontSize="10" fill={lbl}>Integration layer</text>

      {/* HeyGen */}
      <g filter="url(#ns2)">
        <rect x="580" y="20" width="148" height="54" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="654" y="45" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>HeyGen</text>
      <text x="654" y="62" textAnchor="middle" fontSize="10" fill={lbl}>Video Agent API v3</text>

      {/* CMS (optional, dashed) */}
      <rect x="20" y="100" width="120" height="52" rx="10"
        fill="#f8fafc" stroke={arrow} strokeWidth="1.5" strokeDasharray="5 3" />
      <text x="80" y="124" textAnchor="middle" fontSize="12" fontWeight="700" fill={lbl}>CMS</text>
      <text x="80" y="140" textAnchor="middle" fontSize="10" fill={arrow}>optional</text>

      {/* Job Queue */}
      <g filter="url(#ns2)">
        <rect x="230" y="168" width="160" height="52" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="310" y="192" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Job Queue</text>
      <text x="310" y="208" textAnchor="middle" fontSize="10" fill={lbl}>retry · DLQ</text>

      {/* On-Premise container (dashed) */}
      <rect x="400" y="148" width="340" height="112" rx="12"
        fill="#f8fafc" stroke={stroke} strokeWidth="1.5" strokeDasharray="6 3" />
      <text x="570" y="168" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={arrow}
        letterSpacing="0.8">ON-PREMISE STORAGE</text>

      {/* Blob Storage */}
      <g filter="url(#ns2)">
        <rect x="416" y="176" width="135" height="52" rx="8" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="483" y="200" textAnchor="middle" fontSize="11" fontWeight="700" fill={heading}>Blob Storage</text>
      <text x="483" y="216" textAnchor="middle" fontSize="10" fill={lbl}>video files</text>

      {/* Postgres */}
      <g filter="url(#ns2)">
        <rect x="568" y="176" width="155" height="52" rx="8" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="645" y="200" textAnchor="middle" fontSize="11" fontWeight="700" fill={heading}>Postgres</text>
      <text x="645" y="216" textAnchor="middle" fontSize="10" fill={lbl}>metadata · jobs</text>

      {/* Enablement Tool */}
      <g filter="url(#ns2)">
        <rect x="20" y="248" width="160" height="52" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="100" y="272" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Enablement Tool</text>
      <text x="100" y="288" textAnchor="middle" fontSize="10" fill={lbl}>Highspot · Seismic · etc.</text>

      {/* ── Arrows ────────────────────────────────────────────────────────── */}

      {/* 1a · Browser → App Server (no label) */}
      <line x1="140" y1="43" x2="230" y2="43"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr2)" />

      {/* 1b · App Server → Browser (no label) */}
      <line x1="230" y1="55" x2="140" y2="55"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr2)" />

      {/* 2 · App Server → HeyGen (no label) */}
      <line x1="390" y1="43" x2="580" y2="43"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr2)" />

      {/* 3 · CMS → App Server (dashed, optional, label "brief trigger") */}
      <path d="M 140,126 L 310,126 L 310,74"
        stroke={arrow} strokeWidth="1.5" fill="none" strokeDasharray="5 3" markerEnd="url(#arr2)" />
      <rect x="184" y="118" width="82" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="225" y="130" textAnchor="middle" fontSize="9.5" fill={lbl}>brief trigger</text>

      {/* 4 · App Server → Job Queue (solid, label "enqueue") */}
      <line x1="295" y1="74" x2="295" y2="168"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr2)" />
      <rect x="208" y="140" width="68" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="242" y="152" textAnchor="middle" fontSize="9.5" fill={lbl}>enqueue</text>

      {/* 5 · Job Queue → App Server (dashed, label "dispatch / retry") */}
      <line x1="325" y1="168" x2="325" y2="74"
        stroke={arrow} strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arr2)" />
      <rect x="330" y="140" width="90" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="375" y="152" textAnchor="middle" fontSize="9.5" fill={lbl}>dispatch / retry</text>

      {/* 6 · HeyGen → Blob Storage (elbow, label "auto-push") */}
      <path d="M 654,74 L 654,148 L 483,148 L 483,176"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr2)" />
      <rect x="526" y="139" width="70" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="561" y="151" textAnchor="middle" fontSize="9.5" fill={lbl}>auto-push</text>

      {/* 7 · Blob Storage → Postgres (no label) */}
      <line x1="551" y1="202" x2="568" y2="202"
        stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr2)" />

      {/* 8 · Blob Storage → Enablement Tool (elbow, label "publish") */}
      <path d="M 483,228 L 483,274 L 180,274"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr2)" />
      <rect x="294" y="265" width="56" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="322" y="277" textAnchor="middle" fontSize="9.5" fill={lbl}>publish</text>
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

const TIER1_DECISIONS = [
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

const TIER2_DECISIONS = [
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
    body: "No public TTS preview endpoint in HeyGen API. Dashboard implies an internal route exists. Later: request TTS preview access from account team; proxy as GET /api/voice-preview?voice_id=...",
  },
];

const TECH_TABLE = [
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
            Three tiers, each shippable independently. POC proves the pipeline. On-premises adds auth, persistence, and observability. Production adds queue-based throughput and owned storage. Each tier is a superset of the previous — no rework, only additions.
          </p>
        </motion.div>

        {/* ── Tier 0 (special — contains diagram) ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="rounded-2xl border border-blue/20 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue/10 text-blue">Tier 0</span>
            <h2 className="text-lg font-black text-foreground tracking-tight">Proof of Concept (POC)</h2>
          </div>
          <p className="text-sm text-muted mb-6">Brief in → video URL out.</p>

          {/* Diagram */}
          <div className="bg-gray-50/60 rounded-xl border border-border p-4 mb-6">
            <Tier0Diagram />
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

        </motion.div>

        {/* ── Tier 1 ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={2}
          className="rounded-2xl border border-purple-100 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-600">Tier 1</span>
            <h2 className="text-lg font-black text-foreground tracking-tight">On-premises</h2>
          </div>
          <p className="text-sm text-muted mb-6">Authentication, job persistence, and direct on-premise delivery.</p>

          <div className="bg-gray-50/60 rounded-xl border border-border p-4 mb-6">
            <Tier1Diagram />
          </div>

          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Arch decisions</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIER1_DECISIONS.map((d) => (
                <div key={d.label} className="flex flex-col gap-1 p-3 bg-white rounded-xl border border-border">
                  <span className="text-xs font-semibold text-foreground">{d.label}</span>
                  <span className="text-xs text-muted leading-relaxed">{d.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Tier 2 ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={3}
          className="rounded-2xl border border-orange-100 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600">Tier 2</span>
            <h2 className="text-lg font-black text-foreground tracking-tight">Production</h2>
          </div>
          <p className="text-sm text-muted mb-6">Helios internal product at scale — doc ingestion, async queue, Enablement Tool delivery.</p>

          <div className="bg-gray-50/60 rounded-xl border border-border p-4 mb-6">
            <Tier2Diagram />
          </div>

          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Arch decisions</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIER2_DECISIONS.map((d) => (
                <div key={d.label} className="flex flex-col gap-1 p-3 bg-white rounded-xl border border-border">
                  <span className="text-xs font-semibold text-foreground">{d.label}</span>
                  <span className="text-xs text-muted leading-relaxed">{d.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

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
                  <th className="text-left px-4 py-3 font-semibold text-purple-600">Tier 1 — On-premises</th>
                  <th className="text-left px-4 py-3 font-semibold text-orange-600">Tier 2 — Production</th>
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
