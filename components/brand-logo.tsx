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
  const textColor = light ? "text-white" : "text-[#0f3460]";
  const secondaryColor = light ? "text-white/68" : "text-[#61738C]";

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
        <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden="true" fill="none">
          <defs>
            <linearGradient id="wandrly-mark" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor={light ? "#ffffff" : "#024785"} />
              <stop offset="1" stopColor="#00C2FF" />
            </linearGradient>
          </defs>

          <circle
            cx="24"
            cy="24"
            r="15.5"
            stroke="url(#wandrly-mark)"
            strokeWidth="2.6"
            opacity="0.95"
          />
          <path
            d="M18.5 30.5c0-6.3 3.5-11 8.9-13.4 2.9-1.3 5.5-.3 5.5 2.4 0 2.7-1.8 4.7-4.4 6.8-2.5 2-4.7 4.2-6.7 7.2"
            stroke="url(#wandrly-mark)"
            strokeWidth="2.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21.2 31.8 18 34l.8-3.8"
            stroke={light ? "#ffffff" : "#024785"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="31.8" cy="16.2" r="2.7" fill="#00C2FF" />
        </svg>
      </div>

      {!compact && (
        <div className="leading-none">
          <div
            className={cn(
              "font-[family-name:var(--font-noto-serif)] text-[1.95rem] font-bold tracking-[-0.05em]",
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
