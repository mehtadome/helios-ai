import type { Brief } from "@/app/types";

// ---------------------------------------------------------------------------
// Seed briefs — pre-populate the sidebar on first load.
// Replace with an API fetch (GET /api/briefs) when the backend is wired up.
// createdAt is a display string; swap for ISO timestamps + a formatRelative()
// helper once real timestamps exist.
// ---------------------------------------------------------------------------

export const INITIAL_BRIEFS: Brief[] = [
  {
    id: "brief-demo-1",
    role: "Account Executive",
    language: "English",
    status: "rendering",
    createdAt: "3 hours ago",
    sections: {},
    videos: [
      { language: "English", url: null, video_url: null, blob_url: null, status: "rendering" },
      { language: "French",  url: null, video_url: null, blob_url: null, status: "rendering" },
      { language: "Spanish", url: null, video_url: null, blob_url: null, status: "rendering" },
    ],
  },
  {
    id: "brief-demo-2",
    role: "SDR",
    language: "French",
    status: "rendering",
    createdAt: "12 min ago",
    sections: {},
    videos: [{ language: "French", url: null, video_url: null, blob_url: null, status: "rendering" }],
  },
];

// ---------------------------------------------------------------------------
// Stats helper — will become an API call (GET /api/stats) once the backend
// is wired up. Swap the call site in PortalShell to use the API response.
// ---------------------------------------------------------------------------

export const getMockStats = (briefs: Brief[]) => ({
  totalBriefs:   briefs.length,
  totalVideos:   briefs.reduce((n, b) => n + b.videos.length, 0),
  languagesUsed: [...new Set(briefs.flatMap((b) => b.videos.map((v) => v.language)))],
});
