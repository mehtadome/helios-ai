import type { Brief } from "@/app/types";
import { pollTranslations } from "./pollTranslations";

/**
 * Kicks off a background poll for every pending translation on a brief.
 * Calls onBriefUpdate(briefId, updater) as each language completes — the
 * updater receives the current Brief and returns the patched version, so
 * the caller can apply it safely inside a functional setBriefs call.
 */
export function startTranslationPolling(
  brief: Brief,
  onBriefUpdate: (briefId: string, updater: (b: Brief) => Brief) => void
) {
  const pending = brief.videos.filter(
    (v) => v.translationId && v.status !== "completed" && v.status !== "failed"
  );
  if (pending.length === 0) return;

  pollTranslations(brief, ({ language, url, duration, credit_cost }) => {
    onBriefUpdate(brief.id, (b) => {
      const updatedVideos = b.videos.map((v) =>
        v.language === language
          ? { ...v, url, video_url: url, status: "completed" as const, duration, credit_cost }
          : v
      );
      const allDone = updatedVideos.every(
        (v) => v.status === "completed" || v.status === "failed"
      );
      return { ...b, videos: updatedVideos, status: allDone ? "completed" : b.status };
    });
  });
}
