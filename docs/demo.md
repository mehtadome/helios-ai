# Demo notes

## Presigned S3 — needs a real bucket for the live demo

[`app/api/push-video/route.ts`](../app/api/push-video/route.ts) — Step 3b (presigned S3 PUT) is fully implemented. Both paths are wired end-to-end.

To demo the "Upload to S3" flow, set up an S3 bucket and generate a presigned PUT URL:

- Generate the presigned URL with `ContentType: "video/mp4"` — S3 validates this against the `Content-Type` header we forward, and will reject the PUT if they don't match
- Set expiry to at least 5–10 minutes to cover the transfer
- Add a CORS policy on the bucket allowing PUT from your Vercel domain
- **Risk:** if HeyGen's CDN omits `Content-Length` on the video response, S3 will reject the PUT — verify HeyGen sends it before the demo

---

## Scaling streaming — chunking and checkpointing

The current implementation opens a single stream from HeyGen's CDN and pipes it to the destination in one shot. This is fine for short videos but breaks down at scale.

**Why single-stream fails for long videos (15min+):**
- A network hiccup at minute 12 fails the entire transfer — restart from zero
- Vercel functions have a 300s max execution timeout — a slow connection uploading a large file may exceed it
- No progress visibility — the customer sees a spinner until success or failure

**S3 multipart upload as the solution:**
S3 multipart is designed for exactly this. Each part is uploaded independently with its own presigned URL:

1. Split the video into chunks (S3 minimum 5MB per part)
2. Upload each chunk independently
3. After each chunk succeeds, checkpoint — store `{ partNumber, etag }` in Postgres or return to the browser to hold in state
4. On failure, resume from the last successful checkpoint — not from zero
5. Once all parts land, call `CompleteMultipartUpload` to assemble the file on S3

**The tradeoff:** complexity shifts from the transfer to the setup. The customer must generate presigned URLs per part rather than one URL for the whole file. For the demo, a single presigned PUT is sufficient. For production with long-form video, multipart is the right architecture.
