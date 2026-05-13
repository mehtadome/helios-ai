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
import { startTranslationPolling } from "@/app/lib/startTranslationPolling";

type CompletedTranslation = { translationId: string; language: string; video_url: string };

function applyCompletedTranslations(briefs: Brief[], translations: CompletedTranslation[]): Brief[] {
  if (translations.length === 0) return briefs;
  const byId = new Map(translations.map((t) => [t.translationId, t]));
  return briefs.map((brief) => {
    const updatedVideos = brief.videos.map((v) => {
      if (!v.translationId) return v;
      const match = byId.get(v.translationId);
      if (!match) return v;
      // Always refresh URL — signed URLs expire, so update even if already completed.
      return { ...v, url: match.video_url, video_url: match.video_url, status: "completed" as const };
    });
    const anyChanged = updatedVideos.some((v, i) => v !== brief.videos[i]);
    if (!anyChanged) return brief;
    const allDone = updatedVideos.every((v) => v.status === "completed" || v.status === "failed");
    return { ...brief, videos: updatedVideos, status: allDone ? "completed" : brief.status };
  });
}

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
      } catch { /* fall back to empty */ }

      const visible = redisBriefs.filter((b) => !deletedIdsRef.current.has(b.id));

      console.log("[portal:init] loaded from Redis:", visible);

      if (visible.length > 0) setBriefs(visible);
      setRedisReady(true);

      // Resume polling for any brief still in-flight when the page last unloaded.
      const inProgress = visible.filter(
        (b) => b.jobId && (b.status === "rendering" || b.status === "scripting")
      );
      for (const brief of inProgress) {
        resumePoll(brief, (updated) => {
          setBriefs((prev) => {
            const next = prev.map((b) => (b.id === updated.id ? updated : b));
            saveBriefs(next);
            return next;
          });
          startTranslationPolling(updated, applyBriefUpdate);
        });
      }

      // Resume translation polling for briefs whose master completed before reload.
      for (const brief of visible) {
        startTranslationPolling(brief, applyBriefUpdate);
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
    const seen = new Set<string>();
    const toSave = current.filter((b) => {
      if (b.id.startsWith("brief-demo-") || seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
    const serialized = JSON.stringify(toSave);
    if (serialized === lastSavedRef.current) return;
    lastSavedRef.current = serialized;
    fetch("/api/briefs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: serialized,
    }).catch((err) => console.error("[briefs] persist failed:", err));
  }

  function applyBriefUpdate(briefId: string, updater: (b: Brief) => Brief) {
    setBriefs((prev) => {
      const next = prev.map((b) => (b.id === briefId ? updater(b) : b));
      saveBriefs(next);
      return next;
    });
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

  // Called on intermediate poll ticks when title or progress changes mid-render.
  const handleBriefUpdated = (brief: Brief) => {
    setBriefs((prev) => prev.map((b) => (b.id === brief.id ? { ...b, role: brief.role, progress: brief.progress } : b)));
  };

  // Called when generation completes — updates in-place without changing navigation.
  const handleBriefCompleted = (brief: Brief) => {
    setBriefs((prev) => {
      const next = prev.map((b) => b.id === brief.id ? brief : b);
      saveBriefs(next);
      return next;
    });
    startTranslationPolling(brief, applyBriefUpdate);
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

      const redisBriefs: Brief[] = redisData.ok ? (redisData.briefs ?? []) : [];
      const completedTranslations: CompletedTranslation[] = videosData.translations ?? [];
      const heygenVideos: Brief[] = (videosData.briefs as Brief[]).filter(
        (b) => !deletedIdsRef.current.has(b.id)
      );
      console.log("[refresh] heygen videos:", heygenVideos);

      // Index HeyGen results by brief ID for O(1) upsert lookup.
      const heygenById = new Map(heygenVideos.map((b) => [b.id, b]));

      // Upsert Redis entries: refresh video URL/status/title from HeyGen,
      // but never overwrite sections or translationId.
      const upserted = redisBriefs.map((b) => {
        const fresh = heygenById.get(b.id);
        if (!fresh) return b;
        return {
          ...b,
          role: fresh.role,   // HeyGen-generated title takes precedence
          status: fresh.status,
          videos: b.videos.map((v, i) => ({
            ...v,  // preserves translationId, sections ref, blob_url, etc.
            url:         fresh.videos[i]?.url         ?? v.url,
            video_url:   fresh.videos[i]?.video_url   ?? v.video_url,
            status:      fresh.videos[i]?.status      ?? v.status,
            duration:    fresh.videos[i]?.duration    ?? v.duration,
            credit_cost: fresh.videos[i]?.credit_cost ?? v.credit_cost,
          })),
        };
      });

      // Net-new HeyGen entries not in Redis yet.
      const redisIds = new Set(upserted.map((b) => b.id));
      const newEntries = heygenVideos.filter((b) => !redisIds.has(b.id));

      setBriefs((prev) => {
        const demoBriefs = prev.filter((b) => b.id.startsWith("brief-demo-"));
        const next = applyCompletedTranslations(
          [...demoBriefs, ...upserted, ...newEntries],
          completedTranslations
        );
        saveBriefs(next);
        return next;
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
              <BriefForm onBriefAdded={handleBriefAdded} onBriefUpdated={handleBriefUpdated} onBriefCompleted={handleBriefCompleted} />
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

