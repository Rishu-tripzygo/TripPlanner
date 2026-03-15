"use client";

import { cn } from "@/lib/utils";

export default function SkeletonCard({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[24px] border border-white/8 bg-[#0F1117]",
        className
      )}
    >
      <div className="animate-pulse">
        <div className="h-36 bg-[linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
        <div className="space-y-3 p-6">
          <div className="h-4 w-1/3 rounded-full bg-white/10" />
          <div className="h-6 w-2/3 rounded-full bg-white/10" />
          <div className="h-4 w-full rounded-full bg-white/5" />
          <div className="h-4 w-4/5 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}
