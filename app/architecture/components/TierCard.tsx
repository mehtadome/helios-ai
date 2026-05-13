import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const, delay: i * 0.07 },
  }),
};

interface Decision {
  label: string;
  detail: string;
}

interface TierCardProps {
  label: string;
  badgeClass: string;
  borderClass: string;
  title: string;
  subtitle: string;
  diagram: React.ReactNode;
  decisions: Decision[];
  motionCustom: number;
}

export default function TierCard({
  label,
  badgeClass,
  borderClass,
  title,
  subtitle,
  diagram,
  decisions,
  motionCustom,
}: TierCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={motionCustom}
      className={`rounded-2xl border ${borderClass} p-6 mb-6`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeClass}`}>{label}</span>
        <h2 className="text-lg font-black text-foreground tracking-tight">{title}</h2>
      </div>
      <p className="text-sm text-muted mb-6">{subtitle}</p>

      <div className="bg-gray-50/60 rounded-xl border border-border p-4 mb-6">
        {diagram}
      </div>

      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Arch decisions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {decisions.map((d) => (
            <div key={d.label} className="flex flex-col gap-1 p-3 bg-white rounded-xl border border-border">
              <span className="text-xs font-semibold text-foreground">{d.label}</span>
              <span className="text-xs text-muted leading-relaxed">{d.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
