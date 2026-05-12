import type { BriefStatus, DemoBrief } from "@/app/types";

// ---------------------------------------------------------------------------
// HeyGen integration — queried 2026-05-12 from enterprise account.
// Full dumps in private/heygen_avatars.json and private/heygen_voices.json.
// ---------------------------------------------------------------------------

// Adriana BizTalk Front — professional female, front-facing, non-premium
export const AVATAR_ID = "Adriana_BizTalk_Front_public";

// Female voices, one per language. English is primary.
// Swap any voice_id using private/heygen_voices.json if needed.
export const VOICE_IDS: Record<string, string> = {
  English: "f8c69e517f424cafaecde32dde57096b", // Allison
  French:  "67375f26ab6e44ce8569cea3840ef594", // Gaëlle
  Spanish: "689f48196a9a43c4bbbb67c14fdbb4c6", // Sara Martin
  Chinese: "1b86e7a08ce641c39e530455feb4285b", // Amy
  Italian: "bf04704b87d94e4cb4f2d8f27d8c6e3a", // Violetta
  German:  "becf484d4ec3411b992206f95e6a3aa5", // Lea
};

// B-roll asset URLs per section — must be publicly accessible for HeyGen to fetch.
// Swap placeholder paths for real Helios AI Studio product screens once available.
export const BROLL_ASSETS: Partial<Record<SectionKey, string>> = {
  product:         "/broll/product.svg",
  differentiators: "/broll/differentiators.svg",
};

// ---------------------------------------------------------------------------
// Selectable options
// ---------------------------------------------------------------------------

export const ROLES = ["Account Executive", "SDR", "Partner Manager"] as const;

export const LANGUAGES = [
  "English",
  "French",
  "Spanish",
  "Chinese",
  "Italian",
  "German",
] as const;

// ---------------------------------------------------------------------------
// Brief sections — order, labels, descriptions, placeholders
// ---------------------------------------------------------------------------

export const SECTIONS = [
  {
    key: "open",
    label: "Open",
    description: "Hook / call to attention",
    placeholder:
      "e.g. Every seller in this room has 6 weeks to become an AI expert. Here's your shortcut.",
  },
  {
    key: "problem",
    label: "The problem we're solving",
    description: "Customer pain framing",
    placeholder:
      "e.g. Your buyers are already asking about AI. If you can't speak to it fluently, someone else will.",
  },
  {
    key: "product",
    label: "What Helios AI Studio is",
    description: "Product definition",
    placeholder:
      "e.g. Helios AI Studio is a generative AI platform built natively into the Helios infrastructure stack...",
  },
  {
    key: "differentiators",
    label: "The three things to lead with",
    description: "Core differentiators",
    placeholder:
      "1. Private by default — your data never leaves your environment.\n2. Helios-native — no integration lift.\n3. Transparent cost model — pay per inference, not per seat.",
  },
  {
    key: "motion",
    label: "Your motion",
    description: "Seller action items",
    placeholder:
      "e.g. Run an AI Studio discovery in your next 3 calls using the SPIN framework. Qualify against the cost-of-inaction metric.",
  },
  {
    key: "close",
    label: "Close",
    description: "Urgency / CTA",
    placeholder:
      "e.g. Launch is in 6 weeks. Every week you delay is a week your buyer gets this story from someone else.",
  },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

export type SceneType = "avatar_only" | "avatar_text" | "avatar_broll";

/**
 * Deterministic mapping from brief section → HeyGen scene type.
 * Driven by semantic meaning — not user-selected, not inferred from prompt content.
 * Passing a monolithic prompt risks flattened tone, misplaced B-roll, and broken pacing.
 */
export const SCENE_TYPES: Record<SectionKey, SceneType> = {
  open:             "avatar_only",   // hook — full attention on presenter
  problem:          "avatar_text",   // pain framing — text overlay reinforces the point
  product:          "avatar_broll",  // product definition — show the actual UI
  differentiators:  "avatar_broll",  // three things to lead with — product screenshots
  motion:           "avatar_text",   // seller actions — text keeps CTA visible
  close:            "avatar_only",   // urgency — back to presenter, personal and direct
};

/** Human-readable section labels used in the brief detail view. */
export const SECTION_LABELS: Record<string, string> = {
  open: "Open",
  problem: "The problem we're solving",
  product: "What Helios AI Studio is",
  differentiators: "The three things to lead with",
  motion: "Your motion",
  close: "Close",
};

// ---------------------------------------------------------------------------
// Status display config — dot CSS and sidebar label per status
// ---------------------------------------------------------------------------

export const STATUS_CONFIG: Record<BriefStatus, { dot: string; label: string }> = {
  scripting: { dot: "bg-yellow-400 animate-pulse", label: "Scripting" },
  rendering: { dot: "bg-blue animate-pulse",        label: "Rendering" },
  completed: { dot: "bg-green-500",                 label: "Ready"     },
  failed:    { dot: "bg-red-400",                   label: "Failed"    },
};

// ---------------------------------------------------------------------------
// Pipeline steps shown in the BriefForm status tracker
// ---------------------------------------------------------------------------

export const STATUS_STEPS = [
  { id: "scripting", label: "Script generating", sublabel: "HeyGen Video Agent" },
  { id: "rendering", label: "Video rendering",   sublabel: "HeyGen API"  },
  { id: "complete",  label: "Complete",           sublabel: "MP4 ready"  },
] as const;

// ---------------------------------------------------------------------------
// Demo briefs — hardcoded scenarios for the "Load demo" picker in BriefForm.
// These are permanent fixtures, not mock data; they won't be replaced by an API.
// ---------------------------------------------------------------------------

export const DEMO_BRIEFS: DemoBrief[] = [
  {
    name: "AE Launch Brief",
    role: "Account Executive",
    languages: ["English", "French"],
    sections: {
      open: "Six weeks from today, every buyer in your territory will be asking about generative AI in enterprise infrastructure. The sellers who can answer that question fluently will win. Here's your playbook.",
      problem: "Your buyers are already trialing AI point solutions from vendors who don't understand their stack. If Helios doesn't show up with a credible, integrated AI story first, someone else will own that conversation — and that budget.",
      product: "Helios AI Studio is a generative AI development and deployment platform built natively into the Helios infrastructure stack. It gives enterprises a private, compliant, Helios-native environment to build, tune, and run AI models — without sending data outside their perimeter.",
      differentiators:
        "1. Private by default — all inference happens inside the customer's Helios environment. No data leaves. No compliance exposure.\n2. Helios-native — zero integration lift. AI Studio runs on the infrastructure they already own and trust.\n3. Transparent cost model — pay per inference, not per seat. Predictable at any scale.",
      motion:
        "Run an AI Studio discovery in your next 3 qualified calls. Use the SPIN framework: ask where they're currently running AI workloads, what compliance guardrails they have, and what the cost of a data breach in that context would be. Qualify on cost-of-inaction, not feature fit.",
      close:
        "Launch is in 6 weeks. Every week you wait is a week a competitor gets to define AI for your buyer. Book the discovery, get in the room, and own the narrative before someone else does.",
    },
  },
  {
    name: "SDR Pipeline Brief",
    role: "SDR",
    languages: ["Spanish"],
    sections: {
      open: "You have one job in the next six weeks: get Helios AI Studio into every discovery call your AEs are running. Here's the talk track that will get you there.",
      problem:
        "Enterprise buyers are being bombarded with AI pitches from every direction. Most of them are vague, risky, and vendor-locked. Your buyers don't know who to trust — and that's your opening.",
      product:
        "Helios AI Studio is generative AI that lives inside the customer's own Helios environment. Private. Integrated. No new vendors, no data exposure, no surprise costs.",
      differentiators:
        "1. It's already in their environment — no procurement cycle for a new vendor.\n2. It's private by default — compliance teams will love you, not block you.\n3. It's priced per inference — CFOs can model it, not fear it.",
      motion:
        "Your job is three touches: one cold email referencing their current Helios deployment, one LinkedIn message with the AI Studio one-pager, one call asking a single question — 'Are you currently running any AI workloads on your Helios infrastructure?' That question opens everything.",
      close:
        "The launch window is fixed. In six weeks this goes to market whether your pipeline is ready or not. Stack your meetings now. Every discovery call you book is a revenue conversation your AE can close.",
    },
  },
  {
    name: "Partner Manager Brief",
    role: "Partner Manager",
    languages: ["German", "Chinese"],
    sections: {
      open: "Your partners are your multiplier for the AI Studio launch. If they understand the product, they'll bring it into accounts you've never touched. If they don't, a competitor will get there first through their book of business.",
      problem:
        "Partners don't have time to read product specs. They need a 90-second story they can repeat to their customers in the first five minutes of any meeting. Right now, most of them don't have it.",
      product:
        "Helios AI Studio is a private, Helios-native generative AI platform. Partners can position it as the safe, integrated AI answer for any customer already running Helios infrastructure — no new vendor, no compliance risk, no integration project.",
      differentiators:
        "1. Fastest path to AI for existing Helios customers — no lift required.\n2. Partner-friendly margin structure — services attach is natural and high.\n3. Compliance-first positioning — removes the biggest objection enterprise buyers have to AI adoption.",
      motion:
        "Host a 30-minute partner enablement session this week. Use the AI Studio demo environment. Walk through the three differentiators. Leave them with one discovery question they can use immediately: 'Is your customer running any AI workloads today, and where does that data live?'",
      close:
        "Partners who are enabled before launch will be in the first wave of deals. Partners who aren't will be explaining to their customers why Helios AI Studio came from someone else. Enable them this week — the window is short.",
    },
  },
  {
    name: "Competitive Response",
    role: "Account Executive",
    languages: ["English"],
    sections: {
      open: "A competitor just showed your buyer an AI demo last week. Here's how you walk into that room, acknowledge it, and win.",
      problem:
        "Point AI solutions look compelling in a demo. They fall apart in production — data leaves the environment, compliance flags it, IT can't support it, and the cost model explodes at scale. Your buyer doesn't know this yet. You're about to tell them.",
      product:
        "Helios AI Studio is the only AI platform that runs natively inside your buyer's existing Helios environment. No new vendor. No data leaving the perimeter. No surprise costs. It's AI without the risk that every enterprise lawyer, CISO, and CFO is afraid of.",
      differentiators:
        "1. The competitor's solution requires your data to leave your environment. Ours doesn't — ever.\n2. Their integration requires a 6-month deployment. Ours is live in days on infrastructure you already own.\n3. Their cost model is per seat. Ours is per inference — you pay for what you use, not what you might use.",
      motion:
        "Ask one question before you demo anything: 'When your CISO reviewed the other solution, what questions did they raise about data residency?' Then let them answer. Then show them AI Studio. The contrast does the work for you.",
      close:
        "Your buyer is going to make a decision in the next 30 days. The question is whether it's the right decision. Get back in the room this week, lead with the compliance question, and give them a reason to choose the platform that was built for their environment — not bolted onto it.",
    },
  },
  {
    name: "International Launch",
    role: "SDR",
    languages: ["French", "Spanish", "Italian"],
    sections: {
      open: "Today we're taking Helios AI Studio global. In the next 6 weeks, sellers across Europe and Latin America need to be ready to have the AI conversation in their markets, in their language, with their buyers.",
      problem:
        "AI adoption timelines differ by region — regulatory environments, data sovereignty requirements, and buyer skepticism vary significantly. A one-size-fits-all AI pitch won't work. Your buyers need to hear that Helios understands their specific compliance landscape.",
      product:
        "Helios AI Studio is a private generative AI platform that operates within the customer's own Helios infrastructure. For European and Latin American enterprises, this means full data residency compliance, no cross-border data transfer, and an AI platform that respects local regulatory requirements by design.",
      differentiators:
        "1. Regional compliance built-in — data never crosses borders it shouldn't cross.\n2. Language-native deployment — AI Studio supports multilingual model configurations out of the box.\n3. Local infrastructure — runs on the Helios regions your customers already use.",
      motion:
        "In your first outreach, lead with the data residency angle: 'Given GDPR requirements in your region, I'd like to show you how AI Studio keeps all inference inside your local Helios environment.' That single sentence differentiates you from every other AI pitch they're receiving.",
      close:
        "The global launch is coordinated. Your counterparts in every region are having this conversation simultaneously. Buyers who engage now get access to the early adopter program and dedicated technical onboarding. Those who wait join the standard queue. Book the meeting this week.",
    },
  },
];
