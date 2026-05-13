"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Brief } from "@/app/types";
import BriefSidebar from "./BriefSidebar";
import BriefDetail from "./BriefDetail";
import BriefForm from "@/app/components/BriefForm";
import AccountPopover from "./AccountPopover";
import { INITIAL_BRIEFS } from "@/app/lib/mock-data";
import { resumePoll } from "@/app/lib/resumePoll";

export default function PortalShell() {
  const [briefs, setBriefs] = useState<Brief[]>(INITIAL_BRIEFS);
  const [selectedId, setSelectedId] = useState<string>("new");
  const [refreshing, setRefreshing] = useState(false);
  const deletedIdsRef = useRef<Set<string>>(new Set());
  const lastSavedRef = useRef<string>("");
  const [redisReady, setRedisReady] = useState(false);

  // On mount: seed deletedIdsRef from localStorage so deletions survive page reloads.
  // Then load Redis briefs and merge with HeyGen, filtering out deleted IDs.
  useEffect(() => {
    const stored = localStorage.getItem("helios:deletedIds");
    if (stored) {
      try {
        deletedIdsRef.current = new Set(JSON.parse(stored));
      } catch { /* ignore corrupt storage */ }
    }

    async function init() {
      let redisBriefs: Brief[] = [];
      try {
        const data = await fetch("/api/briefs").then((r) => r.json());
        if (data.ok) redisBriefs = data.briefs;
      } catch { /* fall back */ }

      let heygenBriefs: Brief[] = [];
      try {
        const data = await fetch("/api/videos").then((r) => r.json());
        if (data.ok) {
          heygenBriefs = (data.briefs as Brief[]).filter(
            (b) => !deletedIdsRef.current.has(b.id)
          );
        }
      } catch { /* non-fatal */ }

      // Exclude heygen-* entries whose video URL is already tracked by a brief-*
      // to avoid every past test submission flooding the sidebar.
      const trackedUrls = new Set(
        redisBriefs.flatMap((b) => b.videos.map((v) => v.url)).filter(Boolean)
      );
      const merged = [
        ...redisBriefs,
        ...heygenBriefs.filter(
          (b) => !redisBriefs.some((r) => r.id === b.id) &&
                 !b.videos.some((v) => v.url && trackedUrls.has(v.url))
        ),
      ];

      console.log("[portal:init] redis briefs:", redisBriefs);
      console.log("[portal:init] heygen briefs:", heygenBriefs);
      console.log("[portal:init] merged:", merged);

      if (merged.length > 0) setBriefs(merged);
      setRedisReady(true);

      // Resume polling for any brief that was rendering when the page last unloaded.
      const inProgress = merged.filter(
        (b) => b.jobId && (b.status === "rendering" || b.status === "scripting")
      );
      for (const brief of inProgress) {
        resumePoll(brief, (updated) => {
          setBriefs((prev) => {
            const next = prev.map((b) => (b.id === updated.id ? updated : b));
            saveBriefs(next);
            return next;
          });
        });
      }
    }
    init();
  }, []);

  // Persist briefs to Redis on every change (after initial load).
  // Exclude brief-demo-* so mock seed data never pollutes Redis.
  useEffect(() => {
    if (!redisReady) return;
    saveBriefs(briefs);
  }, [briefs, redisReady]);

  function saveBriefs(current: Brief[]) {
    const toSave = current.filter((b) => !b.id.startsWith("brief-demo-") && !b.id.startsWith("heygen-"));
    const serialized = JSON.stringify(toSave);
    if (serialized === lastSavedRef.current) return;
    lastSavedRef.current = serialized;
    fetch("/api/briefs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: serialized,
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
      const [videosRes, redisRes] = await Promise.all([
        fetch("/api/videos"),
        fetch("/api/briefs"),
      ]);
      const [videosData, redisData] = await Promise.all([
        videosRes.json(),
        redisRes.json(),
      ]);
      if (!videosData.ok) return;

      const redisBriefs: Brief[] = redisData.ok && redisData.briefs.length > 0 ? redisData.briefs : [];

      setBriefs((prev) => {
        // Demo briefs live only in client state (never persisted); keep them.
        const demoBriefs = prev.filter((b) => b.id.startsWith("brief-demo-"));
        const formBriefs = [...demoBriefs, ...redisBriefs];
        const trackedUrls = new Set(
          formBriefs.flatMap((b) => b.videos.map((v) => v.url)).filter(Boolean)
        );
        const fresh = (videosData.briefs as Brief[]).filter(
          (b) =>
            !deletedIdsRef.current.has(b.id) &&
            !b.videos.some((v) => v.url && trackedUrls.has(v.url))
        );
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
                  const next = new Set([...deletedIdsRef.current, id]);
                  deletedIdsRef.current = next;
                  localStorage.setItem("helios:deletedIds", JSON.stringify([...next]));
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

