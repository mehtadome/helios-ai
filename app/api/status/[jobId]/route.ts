import { NextRequest, NextResponse } from "next/server";
import type { BriefStatus } from "@/app/types";

// HeyGen session status → our BriefStatus
function mapStatus(heygenStatus: string): BriefStatus {
  if (heygenStatus === "completed") return "completed";
  if (heygenStatus === "failed")    return "failed";
  if (heygenStatus === "thinking")  return "scripting";
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
  } catch (err) {
    console.error(`[status:${jobId}] network error polling session:`, err);
    return NextResponse.json({ ok: false, error: "Failed to reach HeyGen API" }, { status: 502 });
  }

  if (!sessionRes.ok) {
    console.error(`[status:${jobId}] HeyGen session poll returned ${sessionRes.status}`);
    return NextResponse.json(
      { ok: false, error: `HeyGen returned ${sessionRes.status}` },
      { status: 502 }
    );
  }

  const sessionData = await sessionRes.json();
  const { status: sessionStatus, video_id } = sessionData?.data ?? {};
  console.log(`[status:${jobId}] session status: ${sessionStatus}${video_id ? `, video_id: ${video_id}` : ""}`);

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
  } catch (err) {
    console.error(`[status:${jobId}] network error polling video ${video_id}:`, err);
    return NextResponse.json({ ok: false, error: "Failed to reach HeyGen API" }, { status: 502 });
  }

  if (!videoRes.ok) {
    console.error(`[status:${jobId}] HeyGen video poll returned ${videoRes.status}`);
    return NextResponse.json(
      { ok: false, error: `HeyGen returned ${videoRes.status}` },
      { status: 502 }
    );
  }

  const videoData = await videoRes.json();
  const { status: videoStatus, video_url, failure_code, failure_message, duration } = videoData?.data ?? {};
  const credit_cost = typeof duration === "number" ? Math.ceil(duration / 60) : undefined;
  console.log(`[status:${jobId}] video status: ${videoStatus}`);

  if (videoStatus === "failed") {
    console.error(`[status:${jobId}] HeyGen job failed — code: ${failure_code}, message: ${failure_message}`);
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

  console.log(`[status:${jobId}] completed — video_url: ${video_url}`);

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

  const translationMap: Record<string, string> = {};
  const translationIds: string[] = [];

  if (translationLanguages.length > 0) {
    console.log(`[status:${jobId}] dispatching translations for: ${translationLanguages.join(", ")}`);
    try {
      const translateRes = await fetch("https://api.heygen.com/v3/video-translations", {
        method: "POST",
        headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          video: { type: "url", url: video_url },
          output_languages: translationLanguages,
        }),
      });

      if (translateRes.ok) {
        const translateData = await translateRes.json();
        const ids: string[] = translateData?.data?.video_translation_ids ?? [];
        // IDs are ordered to match output_languages
        translationLanguages.forEach((lang, i) => {
          if (ids[i]) {
            translationIds.push(ids[i]);
            translationMap[lang] = ids[i];
            console.log(`[status:${jobId}] ${lang} translation ID: ${ids[i]}`);
          }
        });
      } else {
        const text = await translateRes.text();
        console.warn(`[status:${jobId}] translation dispatch returned ${translateRes.status}: ${text}`);
      }
    } catch (err) {
      console.error(`[status:${jobId}] translation dispatch error:`, err);
      // Non-fatal — master video is still usable
    }
  }

  return NextResponse.json({
    ok: true,
    status: "completed" as BriefStatus,
    video_url,
    video_id,
    translation_ids: translationIds,
    translation_map: translationMap,
    duration,
    credit_cost,
  });
}
