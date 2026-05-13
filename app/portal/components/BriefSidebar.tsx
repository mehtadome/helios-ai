"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Brief } from "@/app/types";
import { STATUS_CONFIG } from "@/app/lib/constants";
import { formatRelative } from "@/app/lib/utils";

interface Props {
  briefs: Brief[];
  selectedId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

interface TooltipState {
  brief: Brief;
  y: number;
}

export default function BriefSidebar({ briefs, selectedId, onSelect, onNew, onRefresh, refreshing }: Props) {
  const totalCredits = briefs.flatMap((b) => b.videos).reduce((sum, v) => sum + (v.credit_cost ?? 0), 0);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  return (
    <aside className="w-72 flex-shrink-0 border-r border-border flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <a href="/" className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors">
          <span>←</span> Home
        </a>
      </div>
      <div className="px-4 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-foreground tracking-tight">
            Your Briefs
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {briefs.length} brief{briefs.length !== 1 ? "s" : ""}
            {totalCredits > 0 && ` · ${totalCredits} credit${totalCredits !== 1 ? "s" : ""}`}
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
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setTooltip({ brief, y: rect.top });
                }}
                onMouseLeave={() => setTooltip(null)}
                className={`relative w-full text-left px-3 py-3 rounded-xl transition-all ${
                  isSelected
                    ? "bg-blue/8 border border-blue/20"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-xs font-semibold truncate ${isSelected ? "text-blue" : "text-foreground"}`}>
                        {brief.role}
                      </span>
                      <span className="text-border">·</span>
                      <span className="text-xs text-muted truncate">
                        {brief.videos.length > 1 ? "Multiple" : brief.language}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[brief.status].dot}`} />
                      <span className="text-xs text-muted">{STATUS_CONFIG[brief.status].label}</span>
                      {brief.videos.length > 1 && (
                        <>
                          <span className="text-border">·</span>
                          <span className="text-xs text-muted">{brief.videos.length} videos</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted flex-shrink-0 pt-0.5">{formatRelative(brief.createdAt)}</span>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {briefs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-border flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-foreground">No briefs yet</p>
            <p className="text-xs text-muted mt-0.5">Submit your first brief to get started</p>
          </div>
        )}
      </nav>

      {/* Fixed tooltip — rendered outside scroll container to avoid overflow clipping */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 w-52 rounded-xl border border-border bg-white shadow-lg p-3 pointer-events-none"
            style={{ left: 288, top: tooltip.y }}
          >
            <p className="text-xs font-semibold text-foreground mb-1">{tooltip.brief.role}</p>
            <p className="text-xs text-muted mb-1">
              {tooltip.brief.videos.length > 1
                ? tooltip.brief.videos.map((v) => v.language).join(", ")
                : tooltip.brief.language}
            </p>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[tooltip.brief.status].dot}`} />
              <span className="text-xs text-muted">{STATUS_CONFIG[tooltip.brief.status].label}</span>
            </div>
            <p className="text-xs text-muted mt-1">{formatRelative(tooltip.brief.createdAt)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
