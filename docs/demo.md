# Demo notes

## Presigned S3 — needs a real bucket for the live demo

[`app/api/push-video/route.ts`](../app/api/push-video/route.ts) — Step 3b (presigned S3 PUT) is fully implemented. Both paths are wired end-to-end.

To demo the "Upload to S3" flow, set up an S3 bucket and generate a presigned PUT URL:

- Generate the presigned URL with `ContentType: "video/mp4"` — S3 validates this against the `Content-Type` header we forward, and will reject the PUT if they don't match
- Set expiry to at least 5–10 minutes to cover the transfer
- Add a CORS policy on the bucket allowing PUT from your Vercel domain
- **Risk:** if HeyGen's CDN omits `Content-Length` on the video response, S3 will reject the PUT — verify HeyGen sends it before the demo
