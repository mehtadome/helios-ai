"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Brief } from "@/app/types";
import BriefSidebar from "./BriefSidebar";
import BriefDetail from "./BriefDetail";
import BriefForm from "@/app/components/BriefForm";
import { INITIAL_BRIEFS } from "@/app/lib/mock-data";

const STORAGE_KEY = "helios-briefs";

export default function PortalShell() {
  const [briefs, setBriefs] = useState<Brief[]>(INITIAL_BRIEFS);
  const [selectedId, setSelectedId] = useState<string>("new");
  const [refreshing, setRefreshing] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [storageReady, setStorageReady] = useState(false);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBriefs(JSON.parse(saved));
    } catch { /* ignore malformed data */ }
    setStorageReady(true);
  }, []);

  // Persist briefs whenever they change (after initial load)
  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(briefs));
    } catch { /* ignore quota errors */ }
  }, [briefs, storageReady]);

  const handleBriefSubmitted = (brief: Brief) => {
    setBriefs((prev) => [brief, ...prev]);
    setSelectedId(brief.id);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      if (!data.ok) return;
      // Replace all heygen-* briefs with the fresh list, filtering out client-side deleted IDs.
      // HeyGen's list API may lag behind dashboard deletions, so we maintain a local blocklist.
      setBriefs((prev) => {
        const formBriefs = prev.filter((b) => !b.id.startsWith("heygen-"));
        const fresh = (data.briefs as Brief[]).filter((b) => !deletedIds.has(b.id));
        return [...formBriefs, ...fresh];
      });
    } catch (err) {
      console.error("[refresh] failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const selectedBrief = briefs.find((b) => b.id === selectedId);

  return (
    <div className="flex h-screen">
      <BriefSidebar
        briefs={briefs}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNew={() => setSelectedId("new")}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedId === "new" ? (
            <motion.div
              key="new-brief"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <BriefForm onBriefSubmitted={handleBriefSubmitted} />
            </motion.div>
          ) : selectedBrief ? (
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <BriefDetail
                brief={selectedBrief}
                onDelete={(id) => {
                  setDeletedIds((prev) => new Set([...prev, id]));
                  setBriefs((prev) => prev.filter((b) => b.id !== id));
                  setSelectedId("new");
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
