import { NextRequest, NextResponse } from "next/server";

// Stub webhook handler — receives HeyGen job completion callbacks.
// At production scale this would: verify HMAC signature, update job state
// in Postgres, and signal the browser to stop polling via SSE or WebSocket.
export async function POST(req: NextRequest) {
  const payload = await req.json();
  console.log("[webhook] HeyGen callback:", JSON.stringify(payload));
  return NextResponse.json({ ok: true });
}
