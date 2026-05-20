# Helios AI

**Live demo: [helios-ai-eosin.vercel.app](https://helios-ai-eosin.vercel.app)** | **[Presentation](https://gamma.app/docs/Helios-AI-Studio-i0cbge6d021yek1)**

Seller-enablement video generation platform built on [HeyGen's Video Agent API](https://docs.heygen.com). Sales teams submit a structured brief and receive a localized, avatar-narrated MP4 — without production crews or manual localization.

Built as a POC for the HeyGen FDE take-home challenge.

## What it does

- **Brief input** — a 6-section structured form (open, problem, product, differentiators, motion, close) with role variant (AE / SDR / Partner Manager) and target language selection
- **Multi-language** — one brief generates parallel video outputs in up to 6 languages (English, French, Spanish, Chinese, Italian, German)
- **Portal** — brief history sidebar, per-language video tabs, rendering status tracker
- **Demo briefs** — five pre-loaded scenarios covering AE launch, SDR pipeline, partner enablement, competitive response, and international rollout

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion v12 |
| Script generation | HeyGen Video Agent API v3 (internal) |
| Video generation | HeyGen Video Agent API v3 (planned) |

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The portal is at [http://localhost:3000/portal](http://localhost:3000/portal).

```bash
npm run build   # production build
npm run lint    # eslint
```

## Architecture

Architecture: [helios-ai-eosin.vercel.app/architecture](https://helios-ai-eosin.vercel.app/architecture)

See [`docs/api.md`](docs/api.md) for HeyGen Video Agent API integration notes.

## Project structure

```
app/
  api/
    briefs/             # GET / PUT / DELETE — Redis brief persistence
    generate/           # POST — HeyGen Video Agent session submission
    push-video/         # POST — proxy completed video to destination URL
    status/[jobId]/     # GET — master video poll + translation dispatch
    translation-status/ # GET — per-language translation poll
    videos/             # GET — HeyGen video list
    webhook/            # POST — HeyGen completion callback (T0 stub)
  architecture/         # in-app architecture diagram and tier breakdown
  components/           # BriefForm, HeroSection, Navbar, SceneVisual
  lib/
    constants.ts            # roles, languages, sections, avatar/voice IDs, B-roll assets
    mock-data.ts            # demo brief seed data
    pollTranslations.ts     # per-language translation poll loop
    redis.ts                # Redis client with reconnect strategy
    resumePoll.ts           # master video poll loop
    startTranslationPolling.ts  # kicks off pollTranslations per pending language
    utils.ts                # formatRelative()
  portal/
    components/     # PortalShell, BriefSidebar, BriefDetail, DownloadModal, AccountPopover
  types.ts          # shared TypeScript interfaces
```
