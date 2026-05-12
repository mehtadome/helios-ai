import { NextRequest, NextResponse } from "next/server";

// Stub webhook handler — receives HeyGen job completion callbacks.
// At production scale this would: verify HMAC signature, update job state
// in Postgres, and signal the browser to stop polling via SSE or WebSocket.
export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch (err) {
    console.error("[webhook] failed to parse HeyGen callback body:", err);
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  console.log("[webhook] HeyGen callback received:", JSON.stringify(payload, null, 2));
  return NextResponse.json({ ok: true });
}
