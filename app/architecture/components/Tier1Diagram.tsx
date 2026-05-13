const stroke  = "#e2e8f0";
const arrow   = "#94a3b8";
const lbl     = "#64748b";
const heading = "#0f172a";

export default function Tier1Diagram() {
  return (
    <svg viewBox="0 0 760 278" width="100%" style={{ fontFamily: "inherit", overflow: "visible" }}>
      <defs>
        <marker id="arr1" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill={arrow} />
        </marker>
        <filter id="ns1" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodOpacity="0.07" />
        </filter>
      </defs>

      {/* ── Nodes ─────────────────────────────────────────────────────────── */}

      {/* Browser: x=20, y=25, w=108, h=54 */}
      <g filter="url(#ns1)">
        <rect x="20" y="25" width="108" height="54" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="74" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Browser</text>
      <text x="74" y="67" textAnchor="middle" fontSize="10" fill={lbl}>Client</text>

      {/* SSO: x=144, y=25, w=68, h=54 */}
      <g filter="url(#ns1)">
        <rect x="144" y="25" width="68" height="54" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="178" y="55" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>SSO</text>

      {/* App Server: x=268, y=25, w=148, h=54 */}
      <g filter="url(#ns1)">
        <rect x="268" y="25" width="148" height="54" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="342" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>App Server</text>
      <text x="342" y="67" textAnchor="middle" fontSize="10" fill={lbl}>Integration layer</text>

      {/* HeyGen: x=556, y=25, w=148, h=54 */}
      <g filter="url(#ns1)">
        <rect x="556" y="25" width="148" height="54" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="630" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>HeyGen</text>
      <text x="630" y="67" textAnchor="middle" fontSize="10" fill={lbl}>Video Agent API v3</text>

      {/* Cache (Redis TTL): x=175, y=175, w=155, h=56 */}
      <g filter="url(#ns1)">
        <rect x="175" y="175" width="155" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="252" y="200" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Cache</text>
      <text x="252" y="217" textAnchor="middle" fontSize="10" fill={lbl}>Redis · TTL</text>

      {/* On-Premise container (dashed): x=388, y=148, w=344, h=108 */}
      <rect x="388" y="148" width="344" height="108" rx="12"
        fill="#f8fafc" stroke={stroke} strokeWidth="1.5" strokeDasharray="6 3" />
      <text x="560" y="168" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={arrow}
        letterSpacing="0.8">ON-PREMISE STORAGE</text>

      {/* Postgres: x=404, y=178, w=135, h=52 */}
      <g filter="url(#ns1)">
        <rect x="404" y="178" width="135" height="52" rx="8" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="471" y="202" textAnchor="middle" fontSize="11" fontWeight="700" fill={heading}>Postgres</text>
      <text x="471" y="218" textAnchor="middle" fontSize="10" fill={lbl}>metadata</text>

      {/* Blob Storage: x=556, y=178, w=155, h=52 */}
      <g filter="url(#ns1)">
        <rect x="556" y="178" width="155" height="52" rx="8" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="633" y="202" textAnchor="middle" fontSize="11" fontWeight="700" fill={heading}>Blob Storage</text>
      <text x="633" y="218" textAnchor="middle" fontSize="10" fill={lbl}>video files</text>

      {/* ── Arrows ────────────────────────────────────────────────────────── */}

      {/* 1a · Browser → SSO (no label) */}
      <line x1="128" y1="47" x2="144" y2="47" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />

      {/* 1b · SSO → Browser (no label) */}
      <line x1="144" y1="57" x2="128" y2="57" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />

      {/* 2a · SSO → App Server (no label) */}
      <line x1="212" y1="47" x2="268" y2="47" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />

      {/* 2b · App Server → SSO (no label) */}
      <line x1="268" y1="57" x2="212" y2="57" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />

      {/* 3 · App Server → HeyGen (no label) */}
      <line x1="416" y1="47" x2="556" y2="47" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />

      {/* 4 · HeyGen → Cache (elbow, label "TTL cache") */}
      <path d="M 598,79 L 598,138 L 252,138 L 252,175"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr1)" />
      <rect x="383" y="129" width="72" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="419" y="141" textAnchor="middle" fontSize="9.5" fill={lbl}>TTL cache</text>

      {/* 5 · HeyGen → On-Premise (straight down, label "auto-push") */}
      <line x1="650" y1="79" x2="650" y2="148" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />
      <rect x="656" y="106" width="70" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="691" y="118" textAnchor="middle" fontSize="9.5" fill={lbl}>auto-push</text>

      {/* 6 · App Server → Cache (straight down, no label) */}
      <line x1="280" y1="79" x2="280" y2="175" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />

      {/* 7 · Cache → Postgres (horizontal, label "2nd hit miss") */}
      <line x1="330" y1="203" x2="404" y2="203" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />
      <rect x="330" y="193" width="82" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="371" y="205" textAnchor="middle" fontSize="9.5" fill={lbl}>2nd hit miss</text>
    </svg>
  );
}
