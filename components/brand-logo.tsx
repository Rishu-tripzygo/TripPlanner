"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BrandLogoProps {
  className?: string;
  compact?: boolean;
  light?: boolean;
}

export default function BrandLogo({
  className,
  compact = false,
  light = false,
}: BrandLogoProps) {
  const textColor = light ? "text-white" : "text-[#024785]";
  const secondaryColor = light ? "text-white/70" : "text-[#61738C]";

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={cn("inline-flex items-center gap-3", className)}
    >
      <div
        className={cn(
          "relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border shadow-[0_14px_28px_rgba(26,28,27,0.08)]",
          light
            ? "border-white/20 bg-white/10 backdrop-blur-xl"
            : "border-[rgba(2,71,133,0.1)] bg-[linear-gradient(145deg,#ffffff,#f4f3f1)]"
        )}
      >
        <svg
          viewBox="0 0 48 48"
          className="h-7 w-7"
          aria-hidden="true"
          fill="none"
        >
          <circle
            cx="24"
            cy="24"
            r="13"
            stroke={light ? "white" : "#024785"}
            strokeWidth="2.5"
          />
          <path
            d="M16.5 28.5c3.4-6 7.9-10.6 15-13.8"
            stroke="#2B5F9E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M28.5 14.7 33 13l-1.6 4.7" stroke="#2B5F9E" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#024785]" />
      </div>

      {!compact && (
        <div className="leading-none">
          <div
            className={cn(
              "font-[family-name:var(--font-noto-serif)] text-[1.95rem] font-bold italic tracking-[-0.05em]",
              textColor
            )}
          >
            Wandrly
          </div>
          <div
            className={cn(
              "mt-1 text-[0.62rem] uppercase tracking-[0.34em]",
              secondaryColor
            )}
          >
            Curated Travel AI
          </div>
        </div>
      )}
    </motion.div>
  );
}
