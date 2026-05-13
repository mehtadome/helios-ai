const stroke  = "#e2e8f0";
const arrow   = "#94a3b8";
const lbl     = "#64748b";
const heading = "#0f172a";

export default function Tier2Diagram() {
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

      {/* Browser: x=20, y=20, w=100, h=54 */}
      <g filter="url(#ns2)">
        <rect x="20" y="20" width="100" height="54" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="70" y="45" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Browser</text>
      <text x="70" y="62" textAnchor="middle" fontSize="10" fill={lbl}>Internal UI</text>

      {/* SSO: x=148, y=20, w=68, h=54 */}
      <g filter="url(#ns2)">
        <rect x="148" y="20" width="68" height="54" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="182" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>SSO</text>

      {/* App Server: x=264, y=20, w=148, h=54 */}
      <g filter="url(#ns2)">
        <rect x="264" y="20" width="148" height="54" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="338" y="45" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>App Server</text>
      <text x="338" y="62" textAnchor="middle" fontSize="10" fill={lbl}>Integration layer</text>

      {/* HeyGen: x=580, y=20, w=148, h=54 */}
      <g filter="url(#ns2)">
        <rect x="580" y="20" width="148" height="54" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="654" y="45" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>HeyGen</text>
      <text x="654" y="62" textAnchor="middle" fontSize="10" fill={lbl}>Video Agent API v3</text>

      {/* CMS (optional, dashed): x=20, y=100, w=120, h=52 */}
      <rect x="20" y="100" width="120" height="52" rx="10"
        fill="#f8fafc" stroke={arrow} strokeWidth="1.5" strokeDasharray="5 3" />
      <text x="80" y="124" textAnchor="middle" fontSize="12" fontWeight="700" fill={lbl}>CMS</text>
      <text x="80" y="140" textAnchor="middle" fontSize="10" fill={arrow}>optional</text>

      {/* Job Queue: x=264, y=168, w=148, h=52 */}
      <g filter="url(#ns2)">
        <rect x="264" y="168" width="148" height="52" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="338" y="192" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Job Queue</text>
      <text x="338" y="208" textAnchor="middle" fontSize="10" fill={lbl}>retry · DLQ</text>

      {/* On-Premise container (dashed): x=400, y=148, w=340, h=112 */}
      <rect x="400" y="148" width="340" height="112" rx="12"
        fill="#f8fafc" stroke={stroke} strokeWidth="1.5" strokeDasharray="6 3" />
      <text x="570" y="168" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={arrow}
        letterSpacing="0.8">ON-PREMISE STORAGE</text>

      {/* Blob Storage: x=416, y=176, w=135, h=52 */}
      <g filter="url(#ns2)">
        <rect x="416" y="176" width="135" height="52" rx="8" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="483" y="200" textAnchor="middle" fontSize="11" fontWeight="700" fill={heading}>Blob Storage</text>
      <text x="483" y="216" textAnchor="middle" fontSize="10" fill={lbl}>video files</text>

      {/* Postgres: x=568, y=176, w=155, h=52 */}
      <g filter="url(#ns2)">
        <rect x="568" y="176" width="155" height="52" rx="8" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="645" y="200" textAnchor="middle" fontSize="11" fontWeight="700" fill={heading}>Postgres</text>
      <text x="645" y="216" textAnchor="middle" fontSize="10" fill={lbl}>metadata · jobs</text>

      {/* Enablement Tool: x=20, y=248, w=160, h=52 */}
      <g filter="url(#ns2)">
        <rect x="20" y="248" width="160" height="52" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="100" y="272" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Enablement Tool</text>
      <text x="100" y="288" textAnchor="middle" fontSize="10" fill={lbl}>Highspot · Seismic · etc.</text>

      {/* ── Arrows ────────────────────────────────────────────────────────── */}

      {/* 1a · Browser → SSO (no label) */}
      <line x1="120" y1="43" x2="148" y2="43" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr2)" />

      {/* 1b · SSO → Browser (no label) */}
      <line x1="148" y1="55" x2="120" y2="55" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr2)" />

      {/* 2a · SSO → App Server (no label) */}
      <line x1="216" y1="43" x2="264" y2="43" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr2)" />

      {/* 2b · App Server → SSO (no label) */}
      <line x1="264" y1="55" x2="216" y2="55" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr2)" />

      {/* 3 · App Server → HeyGen (no label) */}
      <line x1="412" y1="43" x2="580" y2="43" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr2)" />

      {/* 4 · CMS → App Server (dashed, optional, label "brief trigger") */}
      <path d="M 140,126 L 338,126 L 338,74"
        stroke={arrow} strokeWidth="1.5" fill="none" strokeDasharray="5 3" markerEnd="url(#arr2)" />
      <rect x="200" y="118" width="82" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="241" y="130" textAnchor="middle" fontSize="9.5" fill={lbl}>brief trigger</text>

      {/* 5 · App Server → Job Queue (solid, label "enqueue") */}
      <line x1="316" y1="74" x2="316" y2="168" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr2)" />
      <rect x="226" y="140" width="68" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="260" y="152" textAnchor="middle" fontSize="9.5" fill={lbl}>enqueue</text>

      {/* 6 · Job Queue → App Server (dashed, label "dispatch / retry") */}
      <line x1="360" y1="168" x2="360" y2="74"
        stroke={arrow} strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arr2)" />
      <rect x="364" y="140" width="90" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="409" y="152" textAnchor="middle" fontSize="9.5" fill={lbl}>dispatch / retry</text>

      {/* 7 · HeyGen → Blob Storage (elbow, label "auto-push") */}
      <path d="M 654,74 L 654,148 L 483,148 L 483,176"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr2)" />
      <rect x="526" y="139" width="70" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="561" y="151" textAnchor="middle" fontSize="9.5" fill={lbl}>auto-push</text>

      {/* 8 · Blob Storage → Postgres (no label) */}
      <line x1="551" y1="202" x2="568" y2="202" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr2)" />

      {/* 9 · Blob Storage → Enablement Tool (elbow, label "publish") */}
      <path d="M 483,228 L 483,274 L 180,274"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr2)" />
      <rect x="294" y="265" width="56" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="322" y="277" textAnchor="middle" fontSize="9.5" fill={lbl}>publish</text>
    </svg>
  );
}
