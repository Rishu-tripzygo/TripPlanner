"use client";

import { BadgeIndianRupee, CalendarDays, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import VanillaTilt from "vanilla-tilt";

interface DestinationCardProps {
  title: string;
  image: string;
  budget: string;
  season: string;
  country: string;
}

export default function DestinationCard({
  title,
  image,
  budget,
  season,
  country,
}: DestinationCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    VanillaTilt.init(ref.current, {
      max: 8,
      speed: 300,
      perspective: 1000,
      glare: false,
      scale: 1.02,
    });
  }, []);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="shrink-0"
    >
      <div
        ref={ref}
        className="group relative h-[260px] w-[340px] overflow-hidden rounded-[24px] border border-white/10 bg-[#0F1117] shadow-[0_8px_40px_rgba(0,0,0,0.55)]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090E] via-[#08090E]/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-3 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#8B9BB4]">
            <MapPin className="size-3.5 text-[#00C2FF]" />
            {country}
          </div>
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#D8E2F1]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5">
              <BadgeIndianRupee className="size-4 text-[#00C2FF]" />
              {budget}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5">
              <CalendarDays className="size-4 text-[#00C2FF]" />
              {season}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
