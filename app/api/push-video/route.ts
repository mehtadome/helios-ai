import { NextRequest, NextResponse } from "next/server";

interface PushVideoBody {
  videoUrl: string;
  destination: string;
  auth?: string;
  method: "webhook" | "presigned";
}

export async function POST(req: NextRequest) {
  let body: PushVideoBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { videoUrl, destination, auth, method } = body;

  if (!videoUrl || !destination || !method) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields: videoUrl, destination, method" },
      { status: 400 }
    );
  }

  if (!URL.canParse(videoUrl)) {
    return NextResponse.json({ ok: false, error: "Invalid videoUrl" }, { status: 400 });
  }

  const videoHostname = new URL(videoUrl).hostname;
  if (!videoHostname.endsWith(".heygen.ai") && !videoHostname.endsWith(".heygen.com")) {
    return NextResponse.json({ ok: false, error: "videoUrl must be a HeyGen CDN URL" }, { status: 400 });
  }

  if (!URL.canParse(destination)) {
    return NextResponse.json({ ok: false, error: "Invalid destination URL" }, { status: 400 });
  }

  console.log(`[push-video] method: ${method}, destination: ${destination}`);

  // Step 2 — fetch from HeyGen
  let heygenRes: Response;
  try {
    heygenRes = await fetch(videoUrl);
  } catch (err) {
    console.error("[push-video] failed to fetch from HeyGen CDN:", err);
    return NextResponse.json({ ok: false, error: "Failed to reach HeyGen CDN" }, { status: 502 });
  }

  if (!heygenRes.ok || !heygenRes.body) {
    console.error(`[push-video] HeyGen CDN returned ${heygenRes.status}`);
    return NextResponse.json(
      { ok: false, error: `HeyGen CDN returned ${heygenRes.status}` },
      { status: 502 }
    );
  }

  const contentType = heygenRes.headers.get("Content-Type") ?? "video/mp4";
  const contentLength = heygenRes.headers.get("Content-Length");
  console.log(`[push-video] fetched from CDN — Content-Type: ${contentType}, Content-Length: ${contentLength ?? "not provided"}`);

  // Step 3a — pipe to webhook endpoint
  if (method === "webhook") {
    const headers: Record<string, string> = { "Content-Type": contentType };
    if (contentLength) headers["Content-Length"] = contentLength;
    if (auth) headers["Authorization"] = auth;

    let pushRes: Response;
    try {
      pushRes = await fetch(destination, {
        method: "POST",
        headers,
        body: heygenRes.body,
        // duplex: "half" tells Node to open a bidirectional stream so it can send the request
      // body while simultaneously reading the response. Without it, Node buffers the entire
      // body into memory before sending — defeating the point of streaming.
      // The fetch type definitions don't include this option yet, hence the suppression.
      // @ts-expect-error — Node 18+ fetch supports duplex but @types/node hasn't caught up
        duplex: "half",
      });
    } catch (err) {
      console.error("[push-video] failed to reach webhook destination:", err);
      return NextResponse.json({ ok: false, error: "Failed to reach destination endpoint" }, { status: 502 });
    }

    if (!pushRes.ok) {
      console.error(`[push-video] webhook destination returned ${pushRes.status}`);
      return NextResponse.json(
        { ok: false, error: `Destination returned ${pushRes.status}` },
        { status: 502 }
      );
    }

    console.log("[push-video] webhook push successful");
    return NextResponse.json({ ok: true });
  }

  // Step 3b — PUT to S3 presigned URL
  // Auth is baked into the presigned URL's query params — no Authorization header.
  // Content-Length is required by S3; if HeyGen omits it the PUT will be rejected.
  const s3Headers: Record<string, string> = { "Content-Type": contentType };
  if (contentLength) s3Headers["Content-Length"] = contentLength;

  if (!contentLength) {
    console.warn("[push-video] Content-Length missing from HeyGen CDN response — S3 PUT may be rejected");
  }

  let s3Res: Response;
  try {
    s3Res = await fetch(destination, {
      method: "PUT",
      headers: s3Headers,
      body: heygenRes.body,
      // @ts-expect-error — Node 18+ fetch supports duplex but @types/node hasn't caught up
      duplex: "half",
    });
  } catch (err) {
    console.error("[push-video] failed to reach S3:", err);
    return NextResponse.json({ ok: false, error: "Failed to reach S3" }, { status: 502 });
  }

  if (!s3Res.ok) {
    console.error(`[push-video] S3 returned ${s3Res.status}`);
    return NextResponse.json(
      { ok: false, error: `S3 returned ${s3Res.status}` },
      { status: 502 }
    );
  }

  console.log("[push-video] S3 PUT successful");
  return NextResponse.json({ ok: true });
}
