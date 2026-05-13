import type { Brief } from "@/app/types";

export type TranslationResult = {
  language: string;
  url: string;
  duration?: number;
  credit_cost?: number;
};

export async function pollTranslations(
  brief: Brief,
  onLanguageCompleted: (result: TranslationResult) => void
) {
  const pending = brief.videos.filter(
    (v) => v.translationId && v.status !== "completed" && v.status !== "failed"
  );
  if (pending.length === 0) return;

  await Promise.all(
    pending.map(async (v) => {
      console.log(`[pollTranslations] starting poll for ${v.language} — translationId: ${v.translationId}`);
      for (let poll = 0; poll < 900; poll++) {
        await new Promise((r) => setTimeout(r, 5000));
        try {
          const res = await fetch(`/api/translation-status/${v.translationId}`);
          const data = await res.json();
          if (!data.ok || data.failed) return;
          if (data.done) {
            onLanguageCompleted({
              language: v.language,
              url: data.video_url,
              duration: data.duration,
              credit_cost: data.credit_cost,
            });
            return;
          }
        } catch {
          return;
        }
      }
    })
  );
}
