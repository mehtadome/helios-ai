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
  await redis.set(BRIEFS_KEY, JSON.stringify(briefs));
  return NextResponse.json({ ok: true });
}
