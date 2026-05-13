"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import TierCard from "./components/TierCard";
import Tier0Diagram from "./components/Tier0Diagram";
import Tier1Diagram from "./components/Tier1Diagram";
import Tier2Diagram from "./components/Tier2Diagram";
import {
  ARCH_DECISIONS,
  TIER1_DECISIONS,
  TIER2_DECISIONS,
  CONCERNS,
  TECH_TABLE,
} from "./data";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const, delay: i * 0.07 },
  }),
};

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-xs font-semibold text-muted hover:text-foreground transition-colors flex items-center gap-1">
          ← Home
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-foreground tracking-tight">Helios</span>
          <span className="text-sm font-black text-blue tracking-tight">AI Studio</span>
          <span className="text-muted mx-1">·</span>
          <span className="text-sm font-semibold text-muted">Architecture</span>
        </div>
        <Link href="/portal" className="text-xs font-semibold bg-foreground text-white px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors">
          Open portal →
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-12">
          <span className="inline-flex items-center gap-2 bg-blue/10 text-blue text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue" />
            Three-tier design
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Architecture
          </h1>
          <p className="text-muted mt-3 max-w-xl leading-relaxed text-sm">
            Three tiers, each shippable independently. POC proves the pipeline. On-premises adds auth, persistence, and observability. Production adds queue-based throughput and owned storage. Each tier is a superset of the previous — no rework, only additions.
          </p>
        </motion.div>

        {/* Tier cards */}
        <TierCard
          label="Tier 0"
          badgeClass="bg-blue/10 text-blue"
          borderClass="border-blue/20"
          title="Proof of Concept (POC)"
          subtitle="Brief in → video URL out."
          diagram={<Tier0Diagram />}
          decisions={ARCH_DECISIONS}
          motionCustom={1}
          current
        />
        <TierCard
          label="Tier 1"
          badgeClass="bg-purple-50 text-purple-600"
          borderClass="border-purple-100"
          title="On-Premises"
          subtitle="Authentication, job persistence, and direct on-premise delivery."
          diagram={<Tier1Diagram />}
          decisions={TIER1_DECISIONS}
          motionCustom={2}
        />
        <TierCard
          label="Tier 2"
          badgeClass="bg-orange-50 text-orange-600"
          borderClass="border-orange-100"
          title="Production"
          subtitle="Helios internal product at scale — doc ingestion, async queue, Enablement Tool delivery."
          diagram={<Tier2Diagram />}
          decisions={TIER2_DECISIONS}
          motionCustom={3}
        />

        {/* Cross-cutting concerns */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
          className="mt-16"
        >
          <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">Cross-cutting concerns</h2>
          <p className="text-sm text-muted mb-8">Applies across all tiers.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONCERNS.map((c, i) => (
              <motion.div
                key={c.title}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.4}
                className="flex flex-col gap-2 p-5 rounded-2xl border border-border"
              >
                <span className="text-sm font-semibold text-foreground">{c.title}</span>
                <p className="text-xs text-muted leading-relaxed">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology decisions table */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
          className="mt-16"
        >
          <h2 className="text-2xl font-black text-foreground tracking-tight mb-6">Technology decisions</h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-muted w-36">Concern</th>
                  <th className="text-left px-4 py-3 font-semibold text-blue">Tier 0 — POC</th>
                  <th className="text-left px-4 py-3 font-semibold text-purple-600">Tier 1 — On-premises</th>
                  <th className="text-left px-4 py-3 font-semibold text-orange-600">Tier 2 — Production</th>
                </tr>
              </thead>
              <tbody>
                {TECH_TABLE.map((row, i) => (
                  <tr key={row.concern} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-3 font-semibold text-foreground">{row.concern}</td>
                    <td className="px-4 py-3 text-muted">{row.t0}</td>
                    <td className="px-4 py-3 text-muted">{row.t1}</td>
                    <td className="px-4 py-3 text-muted">{row.t2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
