import type { Brief } from "@/app/types";

export const INITIAL_BRIEFS: Brief[] = [];

// ---------------------------------------------------------------------------
// Stats helper — will become an API call (GET /api/stats) once the backend
// is wired up. Swap the call site in PortalShell to use the API response.
// ---------------------------------------------------------------------------

export const getMockStats = (briefs: Brief[]) => ({
  totalBriefs:   briefs.length,
  totalVideos:   briefs.reduce((n, b) => n + b.videos.length, 0),
  languagesUsed: [...new Set(briefs.flatMap((b) => b.videos.map((v) => v.language)))],
});
