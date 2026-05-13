import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ translationId: string }> }
) {
  const { translationId } = await params;
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "HEYGEN_API_KEY not configured" }, { status: 500 });
  }

  let res: Response;
  try {
    res = await fetch(`https://api.heygen.com/v3/video-translations/${translationId}`, {
      headers: { "X-Api-Key": apiKey },
    });
  } catch (err) {
    console.error(`[translation-status:${translationId}] network error:`, err);
    return NextResponse.json({ ok: false, error: "Failed to reach HeyGen API" }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json({ ok: false, error: `HeyGen returned ${res.status}` }, { status: 502 });
  }

  const data = await res.json();
  const { status, video_url, duration, failure_message } = data?.data ?? {};
  const credit_cost = typeof duration === "number" ? Math.ceil(duration / 60) : undefined;

  // v3 enum: pending | running | completed | failed
  const done = status === "completed";
  const failed = status === "failed";

  console.log(`[translation-status:${translationId}] status: ${status}${failed ? ` — ${failure_message}` : ""}`);

  return NextResponse.json({ ok: true, done, failed, video_url: done ? video_url : null, duration, credit_cost });
}
