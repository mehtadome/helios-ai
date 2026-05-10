export type BriefStatus = "scripting" | "rendering" | "completed" | "failed";

export interface DemoBrief {
  name: string;
  role: string;
  languages: string[];
  sections: Record<string, string>;
}

export interface VideoVariant {
  language: string;
  /** Resolved by the API as blob_url ?? video_url ?? null. Portal always reads this field. */
  url: string | null;
  video_url: string | null;  // HeyGen-hosted CDN URL — ephemeral, may expire
  blob_url: string | null;   // customer-owned storage URL — permanent once set
  status: "rendering" | "completed" | "failed";
}

export interface Brief {
  id: string;
  role: string;
  language: string;
  status: BriefStatus;
  createdAt: string;
  sections: Record<string, string>;
  videos: VideoVariant[];
}
