"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Brief, DemoBrief } from "@/app/types";
import {
  ROLES,
  LANGUAGES,
  SECTIONS,
  STATUS_STEPS,
  DEMO_BRIEFS,
  type SectionKey,
} from "@/app/lib/constants";

type Status = "idle" | "scripting" | "rendering" | "complete" | "error";


const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

interface BriefFormProps {
  onBriefSubmitted?: (brief: Brief) => void;
}

export default function BriefForm({ onBriefSubmitted }: BriefFormProps) {
  const [role, setRole] = useState<(typeof ROLES)[number]>("Account Executive");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [sections, setSections] = useState<Partial<Record<SectionKey, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState(0);
  const [demoOpen, setDemoOpen] = useState(false);
  // Step 3 — code-level lockout: blocks concurrent submits even if the UI guard fires late
  const submitting = useRef(false);

  const isValid =
    languages.length > 0 &&
    SECTIONS.every((s) => (sections[s.key] ?? "").trim().length > 0);

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) => {
      if (prev.includes(lang)) {
        return prev.length > 1 ? prev.filter((l) => l !== lang) : prev;
      }
      return [...prev, lang];
    });
  };

  const applyDemo = (demo: DemoBrief) => {
    setRole(demo.role as (typeof ROLES)[number]);
    setLanguages(demo.languages);
    setSections(demo.sections);
    setDemoOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Step 3 — session-level lockout: ignore the submit if already in flight
    if (!isValid || submitting.current) return;
    submitting.current = true;
    setErrorMessage(null);
    setRetryAfter(0);
    setStatus("scripting");

    try {
      // Submit to HeyGen
      let jobId: string;
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections, role, languages }),
        });
        const data = await res.json();
        if (!data.ok) {
          // Step 4 — capture retryAfter for rate-limit countdown
          if (data.error === "rate_limited") setRetryAfter(data.retryAfter ?? 60);
          throw new Error(data.error ?? "Generation failed");
        }
        jobId = data.jobId;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Generation failed";
        setErrorMessage(msg);
        setStatus("error");
        return;
      }

      setStatus("rendering");

      // Poll until complete or failed
      const languagesParam = encodeURIComponent(JSON.stringify(languages));
      let video_url: string | null = null;

      const MAX_POLLS = 75; // 5 min at 4s intervals — well beyond HeyGen's generation window
      for (let poll = 0; poll < MAX_POLLS; poll++) {
        await delay(4000);
        try {
          const res = await fetch(`/api/status/${jobId}?languages=${languagesParam}&dispatch=1`);
          const data = await res.json();
          if (!data.ok) break;
          if (data.status === "failed") {
            setErrorMessage("Video generation failed on HeyGen's side.");
            setStatus("error");
            return;
          }
          if (data.status === "completed") { video_url = data.video_url; break; }
        } catch {
          break;
        }
      }

      if (!video_url) {
        setErrorMessage("Generation timed out — HeyGen job did not resolve within 5 minutes.");
        setStatus("error");
        return;
      }

      setStatus("complete");

      if (onBriefSubmitted) {
        const newBrief: Brief = {
          id: `brief-${Date.now()}`,
          role,
          language: languages[0],
          status: "completed",
          createdAt: "Just now",
          sections: sections as Record<string, string>,
          videos: languages.map((lang) => ({
            language: lang,
            url: lang === languages[0] ? video_url : null,
            video_url: lang === languages[0] ? video_url : null,
            blob_url: null,
            status: "completed" as const,
          })),
        };
        onBriefSubmitted(newBrief);
      }
    } finally {
      submitting.current = false;
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setErrorMessage(null);
    setRetryAfter(0);
  };

  // Step 4 — countdown timer: auto-resets to idle when retryAfter expires
  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = setTimeout(() => {
      setRetryAfter((n) => {
        if (n <= 1) {
          setStatus("idle");
          setErrorMessage(null);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [retryAfter]);

  const getStepState = (stepId: string) => {
    if (status === "scripting" && stepId === "scripting") return "active";
    if (status === "rendering" && stepId === "scripting") return "done";
    if (status === "rendering" && stepId === "rendering") return "active";
    if (status === "complete" && stepId !== "complete") return "done";
    if (status === "complete" && stepId === "complete") return "done";
    return "pending";
  };

  return (
    <div className="py-10 px-8 max-w-3xl mx-auto">
      {/* Header row */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">
            Submit your brief
          </h2>
          <p className="mt-2 text-muted text-sm">
            Fill in all six sections, pick your languages, then generate.
          </p>
        </div>

        {/* Demo picker */}
        <div className="relative flex-shrink-0 mt-1">
          <button
            type="button"
            onClick={() => setDemoOpen((o) => !o)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border border-border text-muted hover:border-blue hover:text-blue transition-all"
          >
            Load demo
            <motion.span
              animate={{ rotate: demoOpen ? 180 : 0 }}
              transition={{ duration: 0.18 }}
              className="inline-block"
            >
              ↓
            </motion.span>
          </button>

          <AnimatePresence>
            {demoOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-border rounded-xl shadow-lg py-1.5 z-20"
              >
                {DEMO_BRIEFS.map((demo) => (
                  <button
                    key={demo.name}
                    type="button"
                    onClick={() => applyDemo(demo)}
                    className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-foreground block">
                      {demo.name}
                    </span>
                    <span className="text-muted">
                      {demo.role} · {demo.languages.join(", ")}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Click-outside overlay */}
          {demoOpen && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDemoOpen(false)}
            />
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
            className="space-y-6"
          >
            {/* Role + Languages row */}
            <motion.div
              variants={fieldVariants}
              className="grid sm:grid-cols-2 gap-4"
            >
              {/* Role selector */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                  Role variant
                </label>
                <div className="flex gap-1 p-1 rounded-xl border border-border bg-gray-50">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        role === r
                          ? "bg-blue text-white shadow-sm"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-select language pills */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                  Target languages
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGES.map((lang) => {
                    const selected = languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          selected
                            ? "bg-blue text-white border-blue"
                            : "bg-white text-muted border-border hover:border-blue/50 hover:text-foreground"
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Brief sections */}
            {SECTIONS.map((section) => {
              const value = sections[section.key] ?? "";
              const filled = value.trim().length > 0;
              return (
                <motion.div key={section.key} variants={fieldVariants}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <label
                      htmlFor={section.key}
                      className="text-sm font-semibold text-foreground flex items-center gap-1.5"
                    >
                      {section.label}
                      {filled && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      )}
                    </label>
                    <span className="text-xs text-muted">
                      {section.description}
                    </span>
                  </div>
                  <textarea
                    id={section.key}
                    rows={3}
                    value={value}
                    onChange={(e) =>
                      setSections((prev) => ({
                        ...prev,
                        [section.key]: e.target.value,
                      }))
                    }
                    placeholder={section.placeholder}
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-sm text-foreground placeholder:text-border focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-all resize-none leading-relaxed ${
                      filled ? "border-green-200" : "border-border"
                    }`}
                  />
                </motion.div>
              );
            })}

            {/* Submit */}
            <motion.div variants={fieldVariants} className="pt-2">
              <motion.button
                type="submit"
                disabled={!isValid}
                whileHover={isValid ? { scale: 1.02 } : {}}
                whileTap={isValid ? { scale: 0.98 } : {}}
                className={`w-full font-bold py-4 rounded-2xl text-sm transition-colors shadow-sm ${
                  isValid
                    ? "bg-blue text-white hover:bg-blue-dark cursor-pointer"
                    : "bg-gray-100 text-muted cursor-not-allowed"
                }`}
              >
                Generate Video →
              </motion.button>
              <p className="text-center text-xs text-muted mt-3">
                {isValid
                  ? `Generating ${languages.length} video${languages.length > 1 ? "s" : ""} — estimated 60–90 seconds`
                  : "Fill in all sections to enable generation"}
              </p>
            </motion.div>
          </motion.form>
        )}

        {status !== "idle" && (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" as const }}
            className="border border-border rounded-2xl overflow-hidden"
          >
            {/* Job meta bar */}
            <div className="px-6 py-4 border-b border-border bg-gray-50 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {role} ·{" "}
                  {languages.length === 1
                    ? languages[0]
                    : `${languages.length} languages`}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Helios AI Studio launch brief
                </p>
              </div>
              {status === "error" ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {errorMessage === "rate_limited" ? "Rate limited" : "Error"}
                </span>
              ) : status !== "complete" ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-blue">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />
                  Processing
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Complete
                </span>
              )}
            </div>

            {/* Steps 3.5 + 4 — error banner replaces steps when generation fails */}
            {status === "error" ? (
              <div className="px-6 py-6">
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                  <p className="text-sm font-semibold text-red-700 mb-1">
                    {errorMessage === "rate_limited" ? "Too many requests" : "Generation failed"}
                  </p>
                  <p className="text-xs text-red-600 leading-relaxed">
                    {errorMessage === "rate_limited" && retryAfter > 0
                      ? `HeyGen rate limit hit — retrying automatically in ${retryAfter}s…`
                      : errorMessage === "rate_limited"
                      ? "Rate limit cleared. You can try again."
                      : (errorMessage ?? "An unexpected error occurred.")}
                  </p>
                </div>
                {(errorMessage !== "rate_limited" || retryAfter === 0) && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleReset}
                      className="text-xs font-medium text-blue hover:text-blue-dark transition-colors"
                    >
                      ← Try again
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-6 py-6 space-y-4">
                {STATUS_STEPS.map((step, i) => {
                  const state = getStepState(step.id);
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className="flex items-center gap-4"
                    >
                      <div className="flex-shrink-0">
                        {state === "done" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-8 h-8 rounded-full bg-blue flex items-center justify-center"
                          >
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </motion.div>
                        )}
                        {state === "active" && (
                          <div className="w-8 h-8 rounded-full border-2 border-blue border-t-transparent animate-spin" />
                        )}
                        {state === "pending" && (
                          <div className="w-8 h-8 rounded-full border-2 border-border" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            state === "pending" ? "text-muted" : "text-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-muted">{step.sublabel}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Reset button (standalone mode only) */}
            {status === "complete" && !onBriefSubmitted && (
              <div className="border-t border-border px-6 py-5 flex justify-center">
                <button
                  onClick={handleReset}
                  className="text-xs font-medium text-blue hover:text-blue-dark transition-colors"
                >
                  ← Generate another
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
