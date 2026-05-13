"use client";

import { motion } from "framer-motion";

const scenes = [
  {
    label: "Open",
    gradient: "from-blue/20 via-blue/10 to-transparent",
    border: "border-blue/30",
    rotate: "-6deg",
    x: "-20px",
    y: "10px",
    z: 0,
  },
  {
    label: "Problem",
    gradient: "from-violet-400/20 via-purple-300/10 to-transparent",
    border: "border-violet-300/40",
    rotate: "3deg",
    x: "10px",
    y: "-15px",
    z: 1,
  },
  {
    label: "Close",
    gradient: "from-cyan-300/25 via-blue/10 to-transparent",
    border: "border-cyan-300/40",
    rotate: "-1deg",
    x: "30px",
    y: "20px",
    z: 2,
  },
];

export default function SceneVisual() {
  return (
    <div className="relative w-full h-[420px] flex items-center justify-center select-none">
      {/* Glow backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full bg-blue/10 blur-3xl" />
      </div>

      {scenes.map((scene, i) => (
        <motion.div
          key={scene.label}
          className={`absolute w-56 h-40 rounded-2xl border bg-gradient-to-br ${scene.gradient} ${scene.border} backdrop-blur-sm overflow-hidden`}
          style={{
            rotate: scene.rotate,
            x: scene.x,
            y: scene.y,
            zIndex: scene.z,
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [scene.y, `calc(${scene.y} - 8px)`, scene.y],
          }}
          transition={{
            opacity: { duration: 0.5, delay: 0.3 + i * 0.15 },
            scale: { duration: 0.5, delay: 0.3 + i * 0.15 },
            y: {
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            },
          }}
        >
          <div className="p-4 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue animate-pulse" />
              <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                {scene.label}
              </span>
            </div>
            {/* Skeleton lines */}
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-foreground/10 w-3/4" />
              <div className="h-2 rounded-full bg-foreground/10 w-1/2" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-blue/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue/50" />
              </div>
              <div className="h-2 rounded-full bg-foreground/10 w-16" />
            </div>
          </div>
        </motion.div>
      ))}

      {/* "Rendering" badge */}
      <motion.div
        className="absolute bottom-8 right-8 flex items-center gap-2 bg-white border border-border rounded-full px-3 py-1.5 shadow-sm text-xs font-medium text-muted"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />
        Rendering 6 languages
      </motion.div>
    </div>
  );
}
