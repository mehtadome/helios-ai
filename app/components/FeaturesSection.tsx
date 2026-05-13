"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "6 avatars",
    description: "3 female, 3 male — all non-premium, front-facing HeyGen personas selectable at brief submission.",
  },
  {
    title: "6 voices",
    description: "Gender-matched English voice selection (Allison, Jessica, Hope / John, David, Adam). Non-English languages use language-native voices automatically.",
  },
  {
    title: "6 languages",
    description: "English, French, Spanish, Chinese, Italian, German. Master video generated first; translations fan out in parallel on completion.",
  },
  {
    title: "3 role variants",
    description: "Account Executive, SDR, and Partner Manager — each with a distinct coaching tone baked into the prompt.",
  },
  {
    title: "5 demo briefs",
    description: "Pre-filled brief presets (AE Launch, SDR Pipeline, Partner Manager, Competitive Response, International Launch) for instant demo-readiness.",
  },
  {
    title: "Real-time status tracker",
    description: "Scripting → Rendering → Complete step tracker with elapsed timer. Brief appears in sidebar immediately on submit.",
  },
  {
    title: "Per-language video tabs",
    description: "Each completed brief shows one tab per language variant with individual render status dots and direct MP4 playback.",
  },
  {
    title: "Brief persistence",
    description: "Submitted briefs (sections, role, status, videos) are stored in Redis and survive page refresh.",
  },
  {
    title: "Rate limiting",
    description: "Per-IP cooldown via Redis TTL — prevents duplicate submissions and surfaces a countdown timer to the user.",
  },
  {
    title: "Webhook integration",
    description: "HeyGen POSTs completion events to /api/webhook. Payload logged server-side; foundation for Tier 1 push-to-storage wiring.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            POC
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            What's built
          </h2>
          <p className="text-sm text-muted mt-2 max-w-lg">
            Everything live in the current POC — no stubs, no mocks.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex flex-col gap-2 p-5 rounded-2xl border border-border hover:border-green-200 hover:bg-green-50/30 transition-all"
            >
              <span className="text-sm font-semibold text-foreground">{f.title}</span>
              <p className="text-xs text-muted leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
