"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Brief } from "@/app/types";
import BriefSidebar from "./BriefSidebar";
import BriefDetail from "./BriefDetail";
import BriefForm from "@/app/components/BriefForm";
import AccountPopover from "./AccountPopover";
import { INITIAL_BRIEFS } from "@/app/lib/mock-data";

export default function PortalShell() {
  const [briefs, setBriefs] = useState<Brief[]>(INITIAL_BRIEFS);
  const [selectedId, setSelectedId] = useState<string>("new");
  const [refreshing, setRefreshing] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [redisReady, setRedisReady] = useState(false);

  // Load persisted briefs from Redis on mount
  useEffect(() => {
    fetch("/api/briefs")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.briefs.length > 0) setBriefs(data.briefs);
      })
      .catch(() => { /* fall back to INITIAL_BRIEFS */ })
      .finally(() => setRedisReady(true));
  }, []);

  // Persist briefs to Redis on every change (after initial load).
  // Exclude brief-demo-* so mock seed data never pollutes Redis.
  useEffect(() => {
    if (!redisReady) return;
    saveBriefs(briefs);
  }, [briefs, redisReady]);

  function saveBriefs(current: Brief[]) {
    const toSave = current.filter((b) => !b.id.startsWith("brief-demo-") && !b.id.startsWith("heygen-"));
    if (toSave.length === 0) return;
    fetch("/api/briefs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toSave),
    }).catch((err) => console.error("[briefs] persist failed:", err));
  }

  // Called the moment generation starts — adds to sidebar, selects it, and immediately persists
  // (can't wait for the effect since redisReady may still be false at this point).
  const handleBriefAdded = (brief: Brief) => {
    setBriefs((prev) => {
      const next = [brief, ...prev];
      saveBriefs(next);
      return next;
    });
    setSelectedId(brief.id);
  };

  // Called when generation completes — updates in-place without changing navigation.
  const handleBriefCompleted = (brief: Brief) => {
    setBriefs((prev) => {
      const next = prev.map((b) => b.id === brief.id ? brief : b);
      saveBriefs(next);
      return next;
    });
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

      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-4 right-4 z-40">
          <AccountPopover />
        </div>
        <AnimatePresence mode="wait">
          {selectedId === "new" ? (
            <motion.div
              key="new-brief"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <BriefForm onBriefAdded={handleBriefAdded} onBriefCompleted={handleBriefCompleted} />
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
