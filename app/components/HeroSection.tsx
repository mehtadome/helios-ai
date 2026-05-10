"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SceneVisual from "./SceneVisual";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  }),
};

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center pt-20">
      <div className="max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center py-16">
        {/* Left: text */}
        <div className="flex flex-col gap-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="inline-flex items-center gap-2 w-fit bg-blue/10 text-blue text-xs font-semibold px-3 py-1.5 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue" />
            Powered by HeyGen Video Agent API
          </motion.div>

          <div className="overflow-hidden">
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.1}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-foreground"
            >
              Turn your sales brief into
            </motion.h1>
          </div>

          <div className="overflow-hidden -mt-2">
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.22}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-blue"
            >
              videos in minutes
            </motion.h1>
          </div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.38}
            className="text-base md:text-lg text-muted leading-relaxed max-w-md"
          >
            From a structured English brief to multilingual MP4 — AE, SDR, and
            Partner Manager variants. All five languages simultaneously. Brief
            to video in under 24 hours.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.52}
            className="flex flex-wrap items-center gap-4"
          >
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 bg-blue text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-dark transition-colors text-sm"
            >
              Generate your first video
              <span aria-hidden>→</span>
            </Link>
            <a
              href="#"
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              View architecture →
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.62}
            className="flex items-center gap-6 pt-2"
          >
            {[
              { value: "24h", label: "Brief to MP4" },
              { value: "5", label: "Languages" },
              { value: "3", label: "Role variants" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col">
                <span className="text-2xl font-black text-foreground">
                  {value}
                </span>
                <span className="text-xs text-muted">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: animated scene visual */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        >
          <SceneVisual />
        </motion.div>
      </div>
    </section>
  );
}
