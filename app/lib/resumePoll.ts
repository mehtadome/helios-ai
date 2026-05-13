import type { Brief } from "@/app/types";

export async function resumePoll(brief: Brief, onUpdate: (updated: Brief) => void) {
  if (!brief.jobId) return;
  const languages = brief.videos.map((v) => v.language);
  const primaryLanguage = languages.includes("English") ? "English" : languages[0];
  const languagesParam = encodeURIComponent(JSON.stringify(languages));

  for (let poll = 0; poll < 900; poll++) {
    await new Promise((r) => setTimeout(r, 4000));
    try {
      const res = await fetch(`/api/status/${brief.jobId}?languages=${languagesParam}&dispatch=1`);
      const data = await res.json();
      if (!data.ok) return;
      if (data.status === "failed") {
        onUpdate({
          ...brief,
          status: "failed",
          videos: brief.videos.map((v) => ({ ...v, status: "failed" as const })),
        });
        return;
      }
      if (data.status === "completed") {
        onUpdate({
          ...brief,
          status: "completed",
          jobId: undefined,  // clear once done so it won't be re-polled on future reloads
          videos: brief.videos.map((v) => ({
            ...v,
            url: v.language === primaryLanguage ? data.video_url : v.url,
            video_url: v.language === primaryLanguage ? data.video_url : v.video_url,
            status: v.language === primaryLanguage ? ("completed" as const) : v.status,
            video_id: v.language === primaryLanguage ? data.video_id : v.video_id,
            credit_cost: v.language === primaryLanguage ? data.credit_cost : v.credit_cost,
            duration: v.language === primaryLanguage ? data.duration : v.duration,
          })),
        });
        return;
      }
    } catch {
      return;
    }
  }
}
