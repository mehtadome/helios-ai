# Helios AI

**Live demo: [helios-ai-eosin.vercel.app](https://helios-ai-eosin.vercel.app)**

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
| Script generation | Claude Haiku (planned) |
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

See [`docs/architecture.md`](docs/architecture.md) for the full three-tier design (Helios systems → integration middleware → HeyGen API), async job model, and scale story (10k+ videos/year).

See [`docs/api.md`](docs/api.md) for HeyGen Video Agent API integration notes.

## Project structure

```
app/
  components/       # BriefForm, HeroSection, Navbar
  lib/
    constants.ts    # static config: roles, languages, sections, status steps, demo briefs
    mock-data.ts    # seed data to be replaced by API calls
  portal/
    components/     # PortalShell, BriefSidebar, BriefDetail
  types.ts          # shared TypeScript interfaces
docs/               # architecture and API notes
```
