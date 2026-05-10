"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type DownloadTab = "device" | "remote";
type RemoteMethod = "webhook" | "presigned";
type PushState = "idle" | "pushing" | "success" | "error";

interface DownloadModalProps {
  language: string;
  url: string | null;
  onClose: () => void;
}

export default function DownloadModal({ language, url, onClose }: DownloadModalProps) {
  const [tab, setTab] = useState<DownloadTab>("device");
  const [method, setMethod] = useState<RemoteMethod>("webhook");
  const [endpoint, setEndpoint] = useState("");
  const [auth, setAuth] = useState("");
  const [pushState, setPushState] = useState<PushState>("idle");
  const [pushError, setPushError] = useState<string | null>(null);

  const handlePush = async () => {
    if (!endpoint.trim() || !url) return;
    setPushState("pushing");
    setPushError(null);

    try {
      const res = await fetch("/api/push-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: url, destination: endpoint, auth: auth || undefined, method }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Push failed");
      setPushState("success");
    } catch (err) {
      setPushError(err instanceof Error ? err.message : "Unknown error");
      setPushState("error");
    }
  };

  const handleReset = () => {
    setPushState("idle");
    setPushError(null);
    setEndpoint("");
    setAuth("");
  };

  const switchMethod = (m: RemoteMethod) => {
    setMethod(m);
    handleReset();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-2xl border border-border shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">Download video</p>
              <p className="text-xs text-muted mt-0.5">{language} · MP4</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-muted hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {(["device", "remote"] as DownloadTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                  tab === t
                    ? "text-blue border-b-2 border-blue"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t === "device" ? "Download to device" : "Push to your storage"}
              </button>
            ))}
          </div>

          <div className="px-5 py-5">
            {/* Device tab */}
            {tab === "device" && (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="w-12 h-12 rounded-xl bg-blue/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Save MP4 to device</p>
                  <p className="text-xs text-muted mt-1 max-w-xs">
                    Downloads directly from HeyGen&apos;s CDN. File will be available as long as the HeyGen-hosted URL is active.
                  </p>
                </div>
                {url ? (
                  <a
                    href={url}
                    download={`helios-ai-${language.toLowerCase()}.mp4`}
                    className="w-full text-center bg-blue text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-dark transition-colors"
                  >
                    Download MP4
                  </a>
                ) : (
                  <div className="w-full text-center bg-gray-100 text-muted text-sm font-semibold py-2.5 rounded-xl cursor-not-allowed">
                    Connect HeyGen API to download
                  </div>
                )}
              </div>
            )}

            {/* Remote tab — success state */}
            {tab === "remote" && pushState === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 py-4"
              >
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-foreground">Transfer complete</p>
                <p className="text-xs text-muted text-center">
                  {method === "presigned"
                    ? "Video uploaded to your S3-compatible storage."
                    : `Video delivered to ${endpoint}.`}
                </p>
                <button
                  onClick={handleReset}
                  className="text-xs text-blue hover:text-blue-dark font-medium transition-colors mt-1"
                >
                  Push to another destination
                </button>
              </motion.div>
            )}

            {/* Remote tab — error state */}
            {tab === "remote" && pushState === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 py-4"
              >
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-foreground">Transfer failed</p>
                {pushError && <p className="text-xs text-muted text-center">{pushError}</p>}
                <button
                  onClick={handleReset}
                  className="text-xs text-blue hover:text-blue-dark font-medium transition-colors mt-1"
                >
                  Try again
                </button>
              </motion.div>
            )}

            {/* Remote tab — form */}
            {tab === "remote" && pushState !== "success" && pushState !== "error" && (
              <div className="flex flex-col gap-4">
                <div className="flex gap-1.5 p-1 rounded-xl border border-border bg-gray-50">
                  {([
                    { id: "webhook" as RemoteMethod, label: "Webhook endpoint" },
                    { id: "presigned" as RemoteMethod, label: "S3 presigned URL" },
                  ]).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => switchMethod(m.id)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        method === m.id
                          ? "bg-white text-foreground shadow-sm border border-border"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {method === "webhook" ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Endpoint URL
                      </label>
                      <input
                        type="url"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        placeholder="https://your-server.com/api/videos/ingest"
                        className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-foreground placeholder:text-border focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-all"
                      />
                      <p className="text-xs text-muted mt-1.5">
                        Your server receives a POST with the MP4 stream. The webapp pipes bytes from HeyGen&apos;s CDN — no intermediate storage.
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Authorization header <span className="text-muted font-normal">(optional)</span>
                      </label>
                      <input
                        type="password"
                        value={auth}
                        onChange={(e) => setAuth(e.target.value)}
                        placeholder="Bearer sk-..."
                        className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-foreground placeholder:text-border focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-all"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Presigned upload URL
                    </label>
                    <input
                      type="url"
                      value={endpoint}
                      onChange={(e) => setEndpoint(e.target.value)}
                      placeholder="https://your-bucket.s3.amazonaws.com/...?X-Amz-Signature=..."
                      className="w-full px-3 py-2.5 rounded-xl border border-border text-sm text-foreground placeholder:text-border focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-all"
                    />
                    <p className="text-xs text-muted mt-1.5">
                      Generate a one-time PUT URL on your side. No long-lived credentials exchanged — the server streams directly from HeyGen to your bucket.
                    </p>
                  </div>
                )}

                <button
                  onClick={handlePush}
                  disabled={!endpoint.trim() || pushState === "pushing"}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    endpoint.trim() && pushState !== "pushing"
                      ? "bg-blue text-white hover:bg-blue-dark cursor-pointer"
                      : "bg-gray-100 text-muted cursor-not-allowed"
                  }`}
                >
                  {pushState === "pushing" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Pushing…
                    </span>
                  ) : method === "presigned" ? (
                    "Upload to S3"
                  ) : (
                    "Push video"
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
