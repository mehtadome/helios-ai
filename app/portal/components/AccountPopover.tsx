"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AccountPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full bg-foreground text-white text-xs font-black flex items-center justify-center hover:bg-black/80 transition-colors"
        title="Account Admin"
      >
        A
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-10 w-72 bg-white border border-border rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-border">
              <p className="text-sm font-black text-foreground tracking-tight">Account Admin</p>
              <p className="text-xs text-muted mt-0.5">Helios AI Studio</p>
            </div>

            {/* Note body */}
            <div className="px-4 py-4 space-y-3">
              <p className="text-xs text-muted leading-relaxed">
                This panel is reserved for account-level configuration. Features planned here:
              </p>

              {[
                {
                  label: "User settings",
                  note: "Profile, notification preferences, default role and language selections.",
                },
                {
                  label: "RBAC",
                  note: "Role-based access control — who can submit briefs, approve videos, or access the admin panel.",
                },
                {
                  label: "Team & role configuration",
                  note: "Manage org members, assign AE / SDR / Partner Manager roles, and configure per-role defaults.",
                },
              ].map(({ label, note }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-foreground">{label}</span>
                  <span className="text-xs text-muted leading-relaxed">{note}</span>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-border bg-gray-50">
              <p className="text-xs text-muted italic">Requires Tier 1 relational storage.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
