# HeyGen Video Agent API — Summary

## Mental Model

The Video Agent is a **prompt-in, MP4-out** system. You don't explicitly define scenes or layers — you describe what you want in natural language, optionally attach reference files, and the agent handles scripting, avatar selection, scene composition, and rendering. Influence over composition comes through prompt specificity and attached assets.

---

## Authentication

```
X-Api-Key: your-api-key-here
```

All requests. Keys are single-show — copy them at creation time.

---

## Core Endpoints (all v3)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v3/video-agents` | Submit a video generation job |
| `GET` | `/v3/video-agents/{session_id}` | Poll session status |
| `GET` | `/v3/videos/{video_id}` | Poll video status + get download URL |
| `GET` | `/v3/videos` | List videos (paginated) |
| `DELETE` | `/v3/videos/{video_id}` | Remove a video |
| `GET` | `/v3/video-agents/styles` | List available style templates |
| `GET` | `/v3/avatars` | List available avatars |
| `GET` | `/v3/voices` | List 300+ voices (filterable) |

V1/V2 endpoints are maintained until **October 31, 2026**. All new features are v3-only.

---

## Video Creation — Request Schema

`POST /v3/video-agents`

```json
{
  "prompt": "string (required, 1–10,000 chars)",
  "avatar_id": "string (optional — override agent's avatar selection)",
  "voice_id":  "string (optional — override agent's voice selection)",
  "style_id":  "string (optional — curated visual template)",
  "orientation": "landscape | portrait (optional)",
  "files": [ /* up to 20 items — see below */ ],
  "callback_url": "string (optional webhook)",
  "callback_id":  "string (optional correlation ID)"
}
```

**File attachment formats** (used to feed B-roll / reference visuals):

```json
{ "type": "url",      "url": "https://..." }
{ "type": "asset_id", "asset_id": "..." }
{ "type": "base64",   "media_type": "image/png", "data": "..." }
```

Supported file types: PNG, JPEG, MP4, WebM, MP3, WAV, PDF.

---

## Status Lifecycle

```
thinking → generating → completed
                      → failed
```

**Creation response:**
```json
{
  "data": {
    "session_id": "...",
    "video_id": null,
    "status": "thinking",
    "created_at": "..."
  }
}
```

**Completion response (via `/v3/videos/{video_id}`):**
```json
{
  "data": {
    "id": "...",
    "status": "completed",
    "video_url": "...",
    "thumbnail_url": "...",
    "captioned_video_url": "...",
    "subtitle_url": "...",
    "duration": 72.4,
    "completed_at": "...",
    "failure_code": null,
    "failure_message": null
  }
}
```

---

## Avatars

`GET /v3/avatars` — cursor-paginated (1–50 per page).

- Each avatar has a **group ID** and one or more **look IDs** (outfit/style variants)
- Use the **look ID** (`avatar_id`) when creating videos — not the group ID
- Public (HeyGen presets) and private (user-created) avatars available

---

## Voices & Language Selection

`GET /v3/voices` — 300+ voices, cursor-paginated.

Filter parameters:
- `language` — plain name (`"Spanish"`, `"French"`, `"Chinese"`)
- `locale` — BCP-47 tag (`"es-ES"`, `"fr-FR"`, `"zh-CN"`) for accent variants
- `gender` — `"male"` / `"female"`
- `engine` — specific voice engine (e.g. `"starfish"`)

**Language is set through voice selection**, not a separate `language` param on the video request. To generate a video in Spanish: filter voices by `language=Spanish`, pick a `voice_id`, pass it in the video creation request.

`voice_settings` object (in `/v3/videos`):

```json
{
  "locale": "fr-FR",
  "speed": 1.0,
  "pitch": 0
}
```

Speed range: 0.5–1.5. Pitch range: -50 to +50 semitones.

---

## Video Translation (alternate multilingual path)

Instead of generating each language from scratch, generate in English then translate:

1. Submit source video + target language(s)
2. Supports **batch** submission (multiple languages at once)
3. **Speed mode** (default): faster, minor lip-sync tradeoff — good for batch/scale
4. **Precision mode**: better for faces with significant movement or side angles
5. Optional proofread workflow: get SRT → edit → approve → render final
6. `translate_audio_only`: updates audio only, preserves original video
7. `enable_caption`: generates SRT/VTT subtitles
8. `enable_dynamic_duration`: adjusts output length for natural speech pacing

**For the Helios POC:** generate the English master once, then fan out translations — far more efficient than 5 separate generation jobs.

---

## Webhooks

- Register persistent HTTPS endpoints: `POST /v3/webhooks/endpoints`
- HMAC-SHA256 signed payloads — secret shown once at registration, store it securely
- Filter to specific event types or specific resource `entity_id`
- Rotate secrets at any time (immediately invalidates previous)
- Per-request alternative: pass `callback_url` directly on video creation (no persistent registration needed)

---

## Key Gaps / Things to Verify

1. **Rate limits** — not documented publicly. Confirm actual numbers with your HeyGen account team before designing the job queue.
2. **Composition control** — the agent makes scene/B-roll decisions from your prompt + attachments. There is no explicit scene definition API. Leverage is prompt engineering + attached reference images.
3. **Specific avatar/voice IDs** — call `/v3/avatars` and `/v3/voices` with your API key to see what's actually available on your account.
4. **Credit costs per video** — not in the public docs.

---

## Recommended POC Approach

```
Brief sections → structured prompt → POST /v3/video-agents
                                     + attach B-roll images as files[]
                                     → poll session_id until completed
                                     → POST /v3/video-translate (batch, 5 languages)
                                     → poll each translation job
```
