import { cn } from "@/lib/utils";

const styles = {
  planning: "bg-[#1B3A6B]/25 text-[#7ECFFF] border-[#1B3A6B]/40",
  upcoming: "bg-[#00C2FF]/12 text-[#9FE7FF] border-[#00C2FF]/30",
  done: "bg-[#22C55E]/12 text-[#7EE7A2] border-[#22C55E]/30",
  draft: "bg-white/8 text-[#8B9BB4] border-white/10",
} as const;

export default function StatusBadge({
  status,
  className,
}: {
  status: keyof typeof styles;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em]",
        styles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
