# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a take-home POC for a HeyGen FDE (Forward Deployed Engineer) interview. The task is to build a seller-enablement video generation system for a fictional enterprise customer ("Helios Cloud") using HeyGen's Video Agent APIs.

**Deliverable:** A runnable POC + architecture diagrams, presented in a 1-hour live demo to stakeholders role-playing as CRO, Head of Sales Enablement, and Staff Engineer.

## Core Requirements

- **Input:** A structured English brief (6-section schema) + role variant (AE/SDR/Partner Manager) + target language
- **Output:** A 60–90s MP4 composed of A-roll (HeyGen avatar) + B-roll (product visuals)
- **Scale story:** Architecture must explain how this scales to ~10,000 videos/year (do the math: 40 briefs × 3 roles × 5 languages × 4 quarters = 2,400/year minimum)
- **Languages in scope:** French, Spanish, Chinese, Italian, German

## Brief Schema (the core data model)

```typescript
type BriefSection =
  | "open"
  | "problem"
  | "product_definition"
  | "three_differentiators"
  | "seller_motion"
  | "close";

type Brief = {
  section: BriefSection;
  content: string;
}[];
```

Each section maps to a scene type — e.g., `open` → avatar only; `problem` → avatar + overlaid text; `three_differentiators` → avatar + product screenshot B-roll.

## Architecture Constraints

- **Helios owns the integration layer.** HeyGen is the generation engine only. The architecture must show three distinct layers:
  1. Helios systems (CMS, Highspot, seller DB)
  2. Integration middleware (the POC build target)
  3. HeyGen API
- Async job queue pattern is required — never assume synchronous video generation
- Must handle retry logic, idempotency, and polling for job status

## Scoping Decisions (intentional cuts)

The POC builds **one role variant, one language, one brief** to demonstrate the pipeline cleanly. Multi-language and multi-role are explained verbally and via architecture diagrams, not implemented in the demo.

## Demo Surface

The demo must include a simple web UI — not CLI only. Minimum: a form (brief input fields + role/language selectors) → submit → job status tracker → video playback. This is what the non-technical stakeholders (CRO, Head of Enablement) respond to.

## Stakeholder Framing for Presentation

| Audience | Focus | Time Budget |
|---|---|---|
| CRO | Before/after story: 4–6 weeks → 24 hours, 1 language → 5 simultaneous | ~2 min |
| Head of Enablement | Operational workflow — how a brief becomes a video | ~5 min |
| Staff Engineer | Architecture, error handling, idempotency, failure at job #847 | ~15 min |

## Key Contact

Questions about the HeyGen API: chloe.yang@heygen.com / will.ji@heygen.com
