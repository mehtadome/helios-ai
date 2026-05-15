import { NextRequest, NextResponse } from "next/server";
import { AVATAR_ID, VOICE_IDS, BROLL_ASSETS, SCENE_TYPES, type SectionKey } from "@/app/lib/constants";

interface GenerateBody {
  sections: Partial<Record<SectionKey, string>>;
  role: string;
  languages: string[];
  avatar_id?: string;
  voice_id?: string;
}

// Ordered section keys — drives prompt structure and scene guidance.
const SECTION_ORDER: SectionKey[] = [
  "open",
  "problem",
  "product",
  "differentiators",
  "motion",
  "close",
];

// Scene guidance injected per section so HeyGen's agent knows when to cut to B-roll.
const SCENE_DIRECTION: Record<string, string> = {
  avatar_only:  "Present this section as a direct-to-camera monologue. No overlays.",
  avatar_text:  "Present this section with key points as text overlay while the avatar speaks.",
  avatar_broll: "Cut to the attached product visual while the avatar narrates this section.",
};

function buildPrompt(
  sections: Partial<Record<SectionKey, string>>,
  role: string,
  language: string
): string {
  const sectionBlocks = SECTION_ORDER
    .filter((key) => sections[key]?.trim())
    .map((key) => {
      const sceneType = SCENE_TYPES[key];
      const direction = SCENE_DIRECTION[sceneType];
      return `[${key.toUpperCase()}]\n${direction}\n${sections[key]}`;
    })
    .join("\n\n");

  return `You are producing a 60–90 second sales enablement video for a ${role} seller. The video is in ${language}. Follow the section structure exactly — each section has a scene direction that controls composition.

${sectionBlocks}

Keep the total runtime between 60 and 90 seconds. Maintain a confident, coaching tone throughout. Use the attached product visuals for sections marked "Cut to the attached product visual."`;
}

// Build B-roll file list to pass to HeyGen
function buildFiles(
  sections: Partial<Record<SectionKey, string>>,
  baseUrl: string
): { type: "url"; url: string }[] {
  return SECTION_ORDER
    .filter((key) => sections[key]?.trim() && SCENE_TYPES[key] === "avatar_broll" && BROLL_ASSETS[key])
    .map((key) => ({
      type: "url" as const,
      url: `${baseUrl}${BROLL_ASSETS[key]}`,
    }));
}

export async function POST(req: NextRequest) {
  let body: GenerateBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { sections, role, languages, avatar_id, voice_id } = body;

  if (!sections || typeof sections !== "object") {
    return NextResponse.json({ ok: false, error: "Missing sections" }, { status: 400 });
  }

  if (!role || typeof role !== "string") {
    return NextResponse.json({ ok: false, error: "Missing role" }, { status: 400 });
  }

  if (!Array.isArray(languages) || languages.length === 0) {
    return NextResponse.json({ ok: false, error: "Missing languages" }, { status: 400 });
  }

  // Step 1 — build HeyGen payload.
  // Generate primary-language master first; additional languages fan out via /v3/video-translations
  // after the master completes (see /api/status for translation dispatch).
  const primaryLanguage = languages.includes("English") ? "English" : languages[0];
  const baseUrl = process.env.BASE_URL ?? "https://helios-ai-eosin.vercel.app";

  const payload = {
    prompt:      buildPrompt(sections, role, primaryLanguage),
    avatar_id:   avatar_id ?? AVATAR_ID,
    // User-selectable voices are English-only. For a non-English primary, always use the
    // language-matched voice — otherwise HeyGen generates an English master regardless of the prompt.
    voice_id:    primaryLanguage === "English" ? (voice_id ?? VOICE_IDS["English"]) : VOICE_IDS[primaryLanguage],
    orientation: "landscape",
    files:       buildFiles(sections, baseUrl),
    callback_url: `${baseUrl}/api/webhook`,
    callback_id:  crypto.randomUUID(),
  };

  // Step 2 — submit to HeyGen Video Agent API
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "HEYGEN_API_KEY not configured" }, { status: 500 });
  }

  console.log(`[generate] submitting to HeyGen — avatar: ${payload.avatar_id}, voice: ${payload.voice_id}, language: ${primaryLanguage}, sections: ${Object.keys(sections).join(", ")}`);

  let heygenRes: Response;
  try {
    heygenRes = await fetch("https://api.heygen.com/v3/video-agents", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[generate] network error reaching HeyGen:", err);
    return NextResponse.json({ ok: false, error: "Failed to reach HeyGen API" }, { status: 502 });
  }

  // Step 3 — Detect HeyGen 429 and surface retryAfter to the client.
  // Falls back to 60 seconds.
  if (heygenRes.status === 429) {
    const retryAfter = parseInt(heygenRes.headers.get("Retry-After") ?? "60", 10);
    console.warn(`[generate] HeyGen 429 — retryAfter: ${retryAfter}s`);
    return NextResponse.json(
      { ok: false, error: "rate_limited", retryAfter },
      { status: 429 }
    );
  }

  if (!heygenRes.ok) {
    const text = await heygenRes.text();
    console.error(`[generate] HeyGen error ${heygenRes.status}:`, text);
    return NextResponse.json(
      { ok: false, error: `HeyGen returned ${heygenRes.status}: ${text}` },
      { status: 502 }
    );
  }

  const data = await heygenRes.json();
  const sessionId: string = data?.data?.session_id;

  if (!sessionId) {
    console.error("[generate] no session_id in HeyGen response:", JSON.stringify(data));
    return NextResponse.json({ ok: false, error: "No session_id in HeyGen response" }, { status: 502 });
  }

  console.log(`[generate] job accepted — session_id: ${sessionId}, languages: ${languages.join(", ")}`);

  return NextResponse.json({ ok: true, jobId: sessionId, languages });
}
