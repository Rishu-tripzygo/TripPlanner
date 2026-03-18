"use client";

import { CalendarDays, MapPin, WalletCards } from "lucide-react";
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
      speed: 320,
      perspective: 1000,
      glare: false,
      scale: 1.02,
    });
  }, []);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="shrink-0"
    >
      <div
        ref={ref}
        className="group relative h-[280px] w-[370px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0F1117] shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.08),rgba(3,7,18,0.26)_34%,rgba(3,7,18,0.92)_100%)]" />
        <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-white/82 backdrop-blur-xl">
          Signature escape
        </div>

        <div className="absolute inset-x-0 bottom-0 space-y-4 p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#B9C8DB]">
            <MapPin className="size-3.5 text-[#00C2FF]" />
            {country}
          </div>
          <h3 className="text-[30px] font-semibold tracking-[-0.04em] text-white">{title}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#E8F0FA]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2 backdrop-blur-xl">
              <WalletCards className="size-4 text-[#00C2FF]" />
              {budget}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2 backdrop-blur-xl">
              <CalendarDays className="size-4 text-[#00C2FF]" />
              {season}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
