const stroke  = "#e2e8f0";
const arrow   = "#94a3b8";
const label   = "#64748b";
const heading = "#0f172a";

export default function Tier0Diagram() {
  return (
    <svg viewBox="0 0 740 292" width="100%" style={{ fontFamily: "inherit", overflow: "visible" }}>
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill={arrow} />
        </marker>
        <filter id="ns" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodOpacity="0.07" />
        </filter>
      </defs>

      {/* ── Nodes ─────────────────────────────────────────────────────────── */}

      {/* Browser: x=20, y=28, w=128, h=56 */}
      <g filter="url(#ns)">
        <rect x="20" y="28" width="128" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="84" y="53" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Browser</text>
      <text x="84" y="70" textAnchor="middle" fontSize="10" fill={label}>Client</text>

      {/* Next.js / Vercel: x=286, y=28, w=168, h=56 */}
      <g filter="url(#ns)">
        <rect x="286" y="28" width="168" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="370" y="53" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Next.js / Vercel</text>
      <text x="370" y="70" textAnchor="middle" fontSize="10" fill={label}>Integration layer</text>

      {/* HeyGen: x=566, y=28, w=150, h=56 */}
      <g filter="url(#ns)">
        <rect x="566" y="28" width="150" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="641" y="53" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>HeyGen</text>
      <text x="641" y="70" textAnchor="middle" fontSize="10" fill={label}>Video Agent API v3</text>

      {/* Redis: x=166, y=212, w=152, h=56 */}
      <g filter="url(#ns)">
        <rect x="166" y="212" width="152" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="242" y="237" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Redis</text>
      <text x="242" y="254" textAnchor="middle" fontSize="10" fill={label}>helios:briefs</text>

      {/* On-Premise Storage: x=406, y=212, w=196, h=56 */}
      <g filter="url(#ns)">
        <rect x="406" y="212" width="196" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="504" y="237" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>On-Premise Storage</text>
      <text x="504" y="254" textAnchor="middle" fontSize="10" fill={label}>presigned PUT</text>

      {/* ── Arrows ────────────────────────────────────────────────────────── */}

      {/* 1 · Browser → Next.js */}
      <line x1="148" y1="50" x2="286" y2="50" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr)" />
      <rect x="162" y="33" width="110" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="217" y="45" textAnchor="middle" fontSize="9.5" fill={label}>Video Agent API v3</text>

      {/* 2 · Next.js → HeyGen */}
      <line x1="454" y1="50" x2="566" y2="50" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr)" />
      <rect x="456.5" y="58" width="106" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="509.5" y="70" textAnchor="middle" fontSize="9.5" fill={label}>POST /api/generate</text>

      {/* 3 · HeyGen → Next.js (elbow — /api/status poll) */}
      <path d="M 641,84 L 641,108 L 370,108 L 370,84"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
      <rect x="438" y="112" width="130" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="503" y="124" textAnchor="middle" fontSize="9.5" fill={label}>/api/status · 4s poll</text>

      {/* 4 · Next.js → Browser (video_url) */}
      <line x1="286" y1="62" x2="148" y2="62" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr)" />
      <rect x="187" y="64" width="62" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="218" y="76" textAnchor="middle" fontSize="9.5" fill={label}>video_url</text>

      {/* 5 · Next.js → Redis (elbow, left branch) */}
      <path d="M 334,84 L 334,184 L 242,184 L 242,212"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
      <rect x="252" y="175" width="72" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="288" y="187" textAnchor="middle" fontSize="9.5" fill={label}>helios:briefs</text>

      {/* 6 · Next.js → On-Premise (elbow, right branch) */}
      <path d="M 406,84 L 406,184 L 504,184 L 504,212"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
      <rect x="416" y="165" width="92" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="462" y="177" textAnchor="middle" fontSize="9.5" fill={label}>/api/push-video</text>
    </svg>
  );
}
