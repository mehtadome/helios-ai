import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/app/lib/redis";
import type { Brief } from "@/app/types";

const BRIEFS_KEY = "helios:briefs";

export async function GET() {
  const redis = await getRedis();
  const raw = await redis.get(BRIEFS_KEY);
  const briefs: Brief[] = raw ? JSON.parse(raw) : [];
  console.log(`[briefs:GET] loaded ${briefs.length} brief(s) from Redis`);
  briefs.forEach((b) =>
    console.log(`[briefs:GET]  id: ${b.id} | status: ${b.status} | sections: ${Object.keys(b.sections).length} keys`)
  );
  return NextResponse.json({ ok: true, briefs });
}

export async function PUT(req: NextRequest) {
  const redis = await getRedis();
  let briefs: Brief[];
  try {
    briefs = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  console.log(`[briefs:PUT] saving ${briefs.length} brief(s) to Redis`);
  briefs.forEach((b) =>
    console.log(`[briefs:PUT]  id: ${b.id} | status: ${b.status} | sections: ${Object.keys(b.sections).length} keys`)
  );
  try {
    await redis.set(BRIEFS_KEY, JSON.stringify(briefs));
  } catch (err) {
    console.error("[briefs:PUT] Redis write failed:", err);
    return NextResponse.json({ ok: false, error: "Failed to persist briefs" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }
  const redis = await getRedis();
  const raw = await redis.get(BRIEFS_KEY);
  const briefs: Brief[] = raw ? JSON.parse(raw) : [];
  const filtered = briefs.filter((b) => b.id !== id);
  try {
    await redis.set(BRIEFS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("[briefs:DELETE] Redis write failed:", err);
    return NextResponse.json({ ok: false, error: "Failed to persist deletion" }, { status: 500 });
  }
  console.log(`[briefs:DELETE] removed id: ${id}, ${filtered.length} brief(s) remaining`);

  // Best-effort HeyGen video deletion — non-fatal if it fails.
  const apiKey = process.env.HEYGEN_API_KEY;
  const deleted = briefs.find((b) => b.id === id);
  if (apiKey && deleted) {
    const videoIds = deleted.videos.map((v) => v.video_id).filter(Boolean) as string[];
    await Promise.allSettled(
      videoIds.map((vid) =>
        fetch(`https://api.heygen.com/v1/video?video_id=${vid}`, {
          method: "DELETE",
          headers: { "X-Api-Key": apiKey },
        }).then((r) => console.log(`[briefs:DELETE] HeyGen delete ${vid}: ${r.status}`))
      )
    );
  }

  return NextResponse.json({ ok: true });
}
