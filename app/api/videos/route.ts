import { NextResponse } from "next/server";
import type { Brief, BriefStatus, VideoVariant } from "@/app/types";

function formatCreatedAt(unixSeconds: number): string {
  const diff = Math.floor((Date.now() - unixSeconds * 1000) / 1000);
  if (diff < 60)  return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function mapStatus(heygenStatus: string): BriefStatus {
  if (heygenStatus === "completed") return "completed";
  if (heygenStatus === "failed")    return "failed";
  return "rendering";
}

export async function GET() {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "HEYGEN_API_KEY not configured" }, { status: 500 });
  }

  let listRes: Response;
  try {
    listRes = await fetch("https://api.heygen.com/v3/videos?limit=100", {
      headers: { "X-Api-Key": apiKey },
    });
  } catch (err) {
    console.error("[videos] failed to reach HeyGen:", err);
    return NextResponse.json({ ok: false, error: "Failed to reach HeyGen API" }, { status: 502 });
  }

  if (!listRes.ok) {
    console.error(`[videos] HeyGen list returned ${listRes.status}`);
    return NextResponse.json({ ok: false, error: `HeyGen returned ${listRes.status}` }, { status: 502 });
  }

  const listData = await listRes.json();
  const heygenVideos: { id: string; status: string; title: string; created_at: number; video_url: string | null; duration: number | null }[] =
    listData?.data ?? [];

  console.log(`[videos] fetched ${heygenVideos.length} videos from HeyGen`);
  heygenVideos.forEach((v) => console.log(`[videos]  id: ${v.id} | status: ${v.status} | title: ${v.title}`));

  // Filter out translation videos — they appear with "Untitled-{Language}" titles and
  // belong to parent briefs already tracked via brief-* entries.
  const masterVideos = heygenVideos.filter((v) => !v.title?.startsWith("Untitled-"));
  console.log(`[videos] ${masterVideos.length} master video(s) after filtering translations`);

  // v3 includes video_url and duration in the list response — no N+1 detail fetch needed.
  const briefs: Brief[] = masterVideos.map((v) => {
    const status = mapStatus(v.status);
    const duration = v.duration ?? undefined;
    const videoUrl = v.video_url ?? null;
    const credit_cost = typeof duration === "number" ? Math.ceil(duration / 60) : undefined;

    const video: VideoVariant = {
      language: "English",
      url: videoUrl,
      video_url: videoUrl,
      blob_url: null,
      status: status === "completed" || status === "failed" ? status : "rendering",
      duration,
      credit_cost,
    };

    return {
      id: `heygen-${v.id}`,
      role: v.title,
      language: "English",
      status,
      createdAt: formatCreatedAt(v.created_at),
      sections: {},
      videos: [video],
    };
  });

  return NextResponse.json({ ok: true, briefs });
}
