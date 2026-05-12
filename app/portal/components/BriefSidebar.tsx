"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Brief } from "@/app/types";
import { STATUS_CONFIG } from "@/app/lib/constants";

interface Props {
  briefs: Brief[];
  selectedId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  onDelete: (id: string) => void;
}

export default function BriefSidebar({ briefs, selectedId, onSelect, onNew, onRefresh, refreshing, onDelete }: Props) {
  return (
    <aside className="w-72 flex-shrink-0 border-r border-border flex flex-col h-full">
      <div className="px-4 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-foreground tracking-tight">
            Your Briefs
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {briefs.length} brief{briefs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Sync from HeyGen"
            className="flex items-center justify-center w-7 h-7 rounded-full border border-border text-muted hover:border-blue hover:text-blue transition-all disabled:opacity-40"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={onNew}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all border ${
              selectedId === "new"
                ? "bg-blue text-white border-blue"
                : "border-border text-muted hover:border-blue hover:text-blue"
            }`}
          >
            <span aria-hidden>+</span> New
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <AnimatePresence initial={false}>
          {briefs.map((brief) => {
            const isSelected = selectedId === brief.id;
            return (
              <motion.button
                key={brief.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => onSelect(brief.id)}
                className={`relative w-full text-left px-3 py-3 rounded-xl transition-all group ${
                  isSelected
                    ? "bg-blue/8 border border-blue/20"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                {/* Hover tooltip — overlays the card to avoid clipping at top/bottom */}
                <div className="pointer-events-none absolute inset-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-xl overflow-hidden">
                  <div className="w-full h-full bg-gray-900/95 flex flex-col justify-center px-3 py-3">
                    <p className="text-xs font-semibold text-white">{brief.role}</p>
                    <p className="text-xs text-white/60 mt-0.5">{brief.language} · {STATUS_CONFIG[brief.status].label}</p>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isSelected ? "text-blue" : "text-foreground"
                        }`}
                      >
                        {brief.role}
                      </span>
                      <span className="text-border">·</span>
                      <span className="text-xs text-muted truncate">
                        {brief.language}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[brief.status].dot}`}
                      />
                      <span className="text-xs text-muted">
                        {STATUS_CONFIG[brief.status].label}
                      </span>
                      {brief.videos.length > 1 && (
                        <>
                          <span className="text-border">·</span>
                          <span className="text-xs text-muted">
                            {brief.videos.length} videos
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-muted">{brief.createdAt}</span>
                    <div
                      role="button"
                      onClick={(e) => { e.stopPropagation(); onDelete(brief.id); }}
                      className="text-white/40 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Remove from list"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {briefs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-border flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </div>
            <p className="text-xs font-medium text-foreground">No briefs yet</p>
            <p className="text-xs text-muted mt-0.5">Submit your first brief to get started</p>
          </div>
        )}
      </nav>
    </aside>
  );
}
