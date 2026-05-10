export type BriefStatus = "scripting" | "rendering" | "completed" | "failed";

export interface DemoBrief {
  name: string;
  role: string;
  languages: string[];
  sections: Record<string, string>;
}

export interface VideoVariant {
  language: string;
  url: string | null;
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
