"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "Save brief template",
    description: "Persist a filled brief as a reusable template — re-run for new quarters or role variants without re-entering content.",
  },
  {
    title: "Voice preview",
    description: "Play a 5s sound byte for each voice before committing to a full render.",
  },
  {
    title: "Approval workflow",
    description: "Route rendered videos to a stakeholder for sign-off before distribution. One-click approve or reject with comment.",
  },
  {
    title: "Team library",
    description: "Shared org-level brief and video library. Filter by role, language, or quarter. Prevents duplicate renders across sellers.",
  },
  {
    title: "Scheduled generation",
    description: "Queue a brief to render at a future date — e.g., auto-generate the Q3 brief package on the first day of the quarter.",
  },
  {
    title: "CMS / Highspot sync",
    description: "Pull brief content directly from existing content systems. Completed videos auto-publish to Highspot or Seismic.",
  },
  {
    title: "LLM ingestion",
    description: "Generate English master → translate for remaining languages in batch. 1 generation + N translations vs. N+1 generations — ~5× cheaper on HeyGen credits.",
  },
];

export default function EnhancementsSection() {
  return (
    <section id="enhancements" className="py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-blue/10 text-blue text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue" />
            Post-POC
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Enhancements
          </h2>
          <p className="text-sm text-muted mt-2 max-w-lg">
            Features to layer in after the pipeline is proven — each one ships independently.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex flex-col gap-2 p-5 rounded-2xl border border-border hover:border-blue/30 hover:bg-blue/[0.02] transition-all"
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
