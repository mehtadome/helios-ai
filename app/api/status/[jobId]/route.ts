import { NextRequest, NextResponse } from "next/server";
import { VOICE_IDS } from "@/app/lib/constants";
import type { BriefStatus } from "@/app/types";

// HeyGen session status → our BriefStatus
function mapStatus(heygenStatus: string): BriefStatus {
  if (heygenStatus === "completed") return "completed";
  if (heygenStatus === "failed")    return "failed";
  return "rendering";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const apiKey = process.env.HEYGEN_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "HEYGEN_API_KEY not configured" }, { status: 500 });
  }

  // Step 1 — poll session to get video_id
  let sessionRes: Response;
  try {
    sessionRes = await fetch(`https://api.heygen.com/v3/video-agents/${jobId}`, {
      headers: { "X-Api-Key": apiKey },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to reach HeyGen API" }, { status: 502 });
  }

  if (!sessionRes.ok) {
    return NextResponse.json(
      { ok: false, error: `HeyGen returned ${sessionRes.status}` },
      { status: 502 }
    );
  }

  const sessionData = await sessionRes.json();
  const { status: sessionStatus, video_id } = sessionData?.data ?? {};

  // Still thinking/generating — no video_id yet
  if (!video_id) {
    return NextResponse.json({ ok: true, status: mapStatus(sessionStatus), video_url: null });
  }

  // Step 2 — video_id exists, poll video for final URL
  let videoRes: Response;
  try {
    videoRes = await fetch(`https://api.heygen.com/v3/videos/${video_id}`, {
      headers: { "X-Api-Key": apiKey },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to reach HeyGen API" }, { status: 502 });
  }

  if (!videoRes.ok) {
    return NextResponse.json(
      { ok: false, error: `HeyGen returned ${videoRes.status}` },
      { status: 502 }
    );
  }

  const videoData = await videoRes.json();
  const { status: videoStatus, video_url, failure_code, failure_message } = videoData?.data ?? {};

  if (videoStatus === "failed") {
    return NextResponse.json({
      ok: true,
      status: "failed" as BriefStatus,
      video_url: null,
      failure_code,
      failure_message,
    });
  }

  if (videoStatus !== "completed") {
    return NextResponse.json({ ok: true, status: "rendering" as BriefStatus, video_url: null });
  }

  // Step 3 — master complete. Fan out translations only when ?dispatch=1 is present.
  // This is the idempotency guard: only the initial BriefForm poll loop sends dispatch=1.
  // Any subsequent status check (BriefDetail, webhook handler, etc.) omits it,
  // preventing duplicate translation batches being sent to HeyGen for the same job.
  const shouldDispatch = req.nextUrl.searchParams.get("dispatch") === "1";
  const languagesParam = req.nextUrl.searchParams.get("languages");
  let allLanguages: string[] = [];
  try {
    if (languagesParam) allLanguages = JSON.parse(languagesParam);
  } catch { /* malformed param — skip translation dispatch */ }
  const primaryLanguage = allLanguages.includes("English") ? "English" : allLanguages[0];
  const translationLanguages = shouldDispatch
    ? allLanguages.filter((l) => l !== primaryLanguage)
    : [];

  const translationIds: string[] = [];

  if (translationLanguages.length > 0) {
    try {
      const translateRes = await fetch("https://api.heygen.com/v3/video-translate", {
        method: "POST",
        headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id,
          languages: translationLanguages.map((lang) => ({
            language: lang,
            voice_id: VOICE_IDS[lang],
          })),
        }),
      });

      if (translateRes.ok) {
        const translateData = await translateRes.json();
        const ids: string[] = translateData?.data?.translation_ids ?? [];
        translationIds.push(...ids);
      }
    } catch {
      // Translation dispatch failure is non-fatal — master video is still usable
    }
  }

  return NextResponse.json({
    ok: true,
    status: "completed" as BriefStatus,
    video_url,
    video_id,
    translation_ids: translationIds,
  });
}
