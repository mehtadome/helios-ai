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

  // Fetch video list from HeyGen
  let listRes: Response;
  try {
    listRes = await fetch("https://api.heygen.com/v1/video.list?limit=100", {
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
  const heygenVideos: { video_id: string; status: string; video_title: string; created_at: number }[] =
    listData?.data?.videos ?? [];

  console.log(`[videos] fetched ${heygenVideos.length} videos from HeyGen`);
  heygenVideos.forEach((v) => console.log(`[videos]  id: ${v.video_id} | status: ${v.status} | title: ${v.video_title}`));

  // Translations come back with status "success" and title "Untitled-{Language}".
  // They belong to a parent brief already tracked via brief-* entries — exclude them here.
  const masterVideos = heygenVideos.filter((v) => v.status !== "success");
  console.log(`[videos] ${masterVideos.length} master video(s) after filtering translations`);

  // For each completed video, fetch the actual URL — N+1 but acceptable at POC scale.
  // At production scale, store video_url in Postgres on webhook receipt instead.
  const briefs: Brief[] = await Promise.all(
    masterVideos.map(async (v) => {
      let videoUrl: string | null = null;

      let duration: number | undefined;
      if (v.status === "completed") {
        try {
          const videoRes = await fetch(`https://api.heygen.com/v3/videos/${v.video_id}`, {
            headers: { "X-Api-Key": apiKey },
          });
          if (videoRes.ok) {
            const videoData = await videoRes.json();
            videoUrl = videoData?.data?.video_url ?? null;
            duration = videoData?.data?.duration ?? undefined;
          }
        } catch {
          console.warn(`[videos] failed to fetch URL for ${v.video_id}`);
        }
      }

      const status = mapStatus(v.status);
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
        id: `heygen-${v.video_id}`,
        role: v.video_title,
        language: "English",
        status,
        createdAt: formatCreatedAt(v.created_at),
        sections: {},
        videos: [video],
      };
    })
  );

  return NextResponse.json({ ok: true, briefs });
}
