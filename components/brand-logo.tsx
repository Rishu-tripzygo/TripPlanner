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
  const textColor = light ? "text-white" : "text-[#F0F2F7]";
  const secondaryColor = light ? "text-white/60" : "text-[#8B9BB4]";

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={cn("inline-flex items-center gap-3", className)}
    >
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(0,194,255,0.34),transparent_45%),linear-gradient(145deg,#1B3A6B,#0A0E1A)] shadow-[0_0_24px_rgba(0,194,255,0.18)]">
        <svg
          viewBox="0 0 48 48"
          className="h-7 w-7"
          aria-hidden="true"
          fill="none"
        >
          <circle cx="24" cy="24" r="13" stroke="white" strokeWidth="2.5" />
          <path
            d="M14 24h20M24 11c4.5 4.3 6.8 8.7 6.8 13s-2.3 8.7-6.8 13c-4.5-4.3-6.8-8.7-6.8-13s2.3-8.7 6.8-13Z"
            stroke="#00C2FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#00C2FF]" />
      </div>

      {!compact && (
        <div className="leading-none">
          <div className={cn("flex items-center text-[1.2rem] font-semibold tracking-[-0.04em]", textColor)}>
            V
            <span className="mx-[0.02em] inline-flex h-[1.05em] w-[1.05em] items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-[0.95em] w-[0.95em]" aria-hidden="true">
                <circle
                  cx="18"
                  cy="18"
                  r="13"
                  stroke={light ? "white" : "#F0F2F7"}
                  strokeWidth="2.4"
                  fill="none"
                />
                <path
                  d="M7 18h22M18 5.5c4.3 4.1 6.5 8.3 6.5 12.5S22.3 26.4 18 30.5c-4.3-4.1-6.5-8.3-6.5-12.5S13.7 9.6 18 5.5Z"
                  stroke="#00C2FF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            ya
          </div>
          <div className={cn("mt-1 text-[0.63rem] uppercase tracking-[0.34em]", secondaryColor)}>
            AI Travel Planner
          </div>
        </div>
      )}
    </motion.div>
  );
}
