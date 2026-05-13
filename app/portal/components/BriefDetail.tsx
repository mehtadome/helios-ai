"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Brief } from "@/app/types";
import { SECTION_LABELS } from "@/app/lib/constants";
import DownloadModal from "./DownloadModal";

// ---------------------------------------------------------------------------
// Download / push to endpoint (separate from the browser player ⋮ menu)
// ---------------------------------------------------------------------------

function DownloadVideoToolbar({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-3 flex justify-end border-t border-border pt-3">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground shadow-sm hover:border-blue hover:text-blue transition-colors"
      >
        <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download or push to storage
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Video placeholder
// ---------------------------------------------------------------------------

function VideoPlaceholder({
  language,
  status,
  url,
  onDownloadClick,
}: {
  language: string;
  status: string;
  url: string | null;
  onDownloadClick: () => void;
}) {
  if (url) {
    return (
      <div className="w-full">
        <video src={url} controls className="w-full rounded-2xl bg-black" />
        <DownloadVideoToolbar onClick={onDownloadClick} />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-full aspect-video rounded-2xl bg-gray-50 border border-red-100 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Rendering failed</p>
          <p className="text-xs text-muted mt-1">{language} · HeyGen returned a failed status</p>
        </div>
      </div>
    );
  }

  if (status === "rendering") {
    return (
      <div className="relative w-full aspect-video rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center gap-4 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute border-t border-white"
              style={{ top: `${i * 14}%`, left: 0, right: 0 }}
            />
          ))}
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-blue border-t-transparent animate-spin" />
        <div className="text-center">
          <p className="text-sm font-semibold text-white">Rendering {language}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center overflow-hidden group cursor-pointer">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute border-t border-white"
              style={{ top: `${i * 14}%`, left: 0, right: 0 }}
            />
          ))}
        </div>
        {/* Glow */}
        <div className="absolute inset-0 bg-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Play button */}
        <motion.div
          whileHover={{ scale: 1.08 }}
          className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm"
        >
          <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue" />
            <span className="text-xs font-medium text-white/80">{language}</span>
          </div>
          <span className="text-xs text-white/60">73s · MP4</span>
        </div>

        {/* "Connect API" overlay message */}
        <div className="absolute top-3 right-3 max-w-[14rem]">
          <span className="text-xs bg-black/40 text-white/60 px-2 py-1 rounded-full backdrop-blur-sm">
            Connect HeyGen API to view
          </span>
        </div>
      </div>
      <DownloadVideoToolbar onClick={onDownloadClick} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Brief detail
// ---------------------------------------------------------------------------

export default function BriefDetail({ brief, onDelete }: { brief: Brief; onDelete?: (id: string) => void }) {
  const sortedVideos = [...brief.videos].sort((a, b) =>
    a.status === "completed" && b.status !== "completed" ? -1 :
    a.status !== "completed" && b.status === "completed" ? 1 : 0
  );
  const [activeLanguage, setActiveLanguage] = useState(
    sortedVideos.find((v) => v.status === "completed")?.language ?? sortedVideos[0]?.language ?? brief.language
  );
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState<{ language: string; url: string | null } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const activeVideo = brief.videos.find((v) => v.language === activeLanguage) ?? brief.videos[0];
  const hasSections = Object.keys(brief.sections).length > 0;

  return (
    <>
      <motion.div
        key={brief.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="max-w-3xl mx-auto px-8 py-10"
      >
      {/* Failed banner */}
      {brief.status === "failed" && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-700">Generation failed</p>
          <p className="text-xs text-red-600 mt-1 leading-relaxed">
            HeyGen returned a failed status for this job. Submit a new brief to try again.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold bg-gray-100 text-foreground px-2.5 py-1 rounded-full">
              {brief.role}
            </span>
            {brief.videos.length > 0
              ? brief.videos.map((v) => (
                  <span key={v.language} className="text-xs font-semibold bg-blue/10 text-blue px-2.5 py-1 rounded-full">
                    {v.language}
                  </span>
                ))
              : (
                  <span className="text-xs font-semibold bg-blue/10 text-blue px-2.5 py-1 rounded-full">
                    {brief.language}
                  </span>
                )
            }
            {brief.status === "completed" && (
              <span className="text-xs font-semibold bg-green-50 text-green-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Ready
              </span>
            )}
            {brief.status === "rendering" && (
              <span className="text-xs font-semibold bg-blue/10 text-blue px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse inline-block" />
                Rendering
              </span>
            )}
            {brief.status === "scripting" && (
              <span className="text-xs font-semibold bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
                Scripting
              </span>
            )}
            {brief.status === "failed" && (
              <span className="text-xs font-semibold bg-red-50 text-red-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                Failed
              </span>
            )}
          </div>
          <h1 className="text-xl font-black text-foreground tracking-tight">
            {brief.role} Brief
            {brief.videos.length === 1 ? ` — ${brief.language}` : brief.videos.length > 1 ? ` — ${brief.videos.length} languages` : ""}
          </h1>
          <p className="text-xs text-muted mt-1">Submitted {brief.createdAt}</p>
        </div>
      </div>

      {/* Language tabs */}
      {sortedVideos.length > 0 && (
        <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-gray-50 w-fit mb-5">
          {sortedVideos.map((v) => (
            <button
              key={v.language}
              onClick={() => setActiveLanguage(v.language)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeLanguage === v.language
                  ? "bg-white text-foreground shadow-sm border border-border"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {v.language}
              {v.status === "rendering" && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />
              )}
              {v.status === "completed" && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-500" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Video area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLanguage}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <VideoPlaceholder
            language={activeLanguage}
            status={activeVideo?.status ?? "completed"}
            url={activeVideo?.url ?? null}
            onDownloadClick={() =>
              setDownloadTarget({ language: activeLanguage, url: activeVideo?.url ?? null })
            }
          />
          {activeVideo?.credit_cost != null && (
            <p className="text-xs text-muted mt-2">
              {activeVideo.credit_cost} HeyGen credit{activeVideo.credit_cost !== 1 ? "s" : ""}
              {activeVideo.duration != null && ` · ${Math.round(activeVideo.duration)}s`}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Brief sections accordion */}
      {hasSections && (
        <div className="mt-6 border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setSectionsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-gray-50 transition-colors"
          >
            Brief sections
            <motion.span
              animate={{ rotate: sectionsOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted"
            >
              ↓
            </motion.span>
          </button>
          <AnimatePresence>
            {sectionsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="divide-y divide-border border-t border-border">
                  {Object.entries(brief.sections).map(([key, value]) => (
                    <div key={key} className="px-5 py-4">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                        {SECTION_LABELS[key] ?? key}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {value || <span className="text-muted italic">Not provided</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {!hasSections && (
        <p className="mt-4 text-xs text-muted text-center">
          Brief sections not available for this entry.
        </p>
      )}

      {/* Delete */}
      {onDelete && (
        <div className="mt-8 pt-6 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            className="text-xs font-semibold bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-xl transition-colors"
          >
            Delete
          </button>
        </div>
      )}
      </motion.div>

      {/* Download modal */}
      {downloadTarget && (
        <DownloadModal
          language={downloadTarget.language}
          url={downloadTarget.url}
          onClose={() => setDownloadTarget(null)}
        />
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirmOpen && onDelete && (
          <motion.div
            key="delete-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirmOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-2xl border border-border shadow-xl overflow-hidden"
            >
              <div className="px-5 py-5">
                <p className="text-sm font-bold text-foreground">Delete this brief?</p>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  This removes the brief from your list. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2 px-5 py-4 border-t border-border bg-gray-50">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="flex-1 text-xs font-semibold text-foreground px-4 py-2.5 rounded-xl border border-border bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(brief.id);
                    setDeleteConfirmOpen(false);
                  }}
                  className="flex-1 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 px-4 py-2.5 rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
