"use client";

import { CalendarDays, MapPin, WalletCards } from "lucide-react";
import { motion } from "framer-motion";

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
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="w-full"
    >
      <div className="group relative mx-auto h-[310px] w-full overflow-hidden rounded-[30px] border border-[#d8d1c8] bg-[#0F1117] shadow-[0_24px_60px_rgba(26,28,27,0.18)]">
        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,15,28,0.06),rgba(7,15,28,0.24)_34%,rgba(7,15,28,0.88)_100%)]" />
        <div className="absolute inset-x-6 top-6 flex items-center justify-between gap-3">
          <div className="rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/86 backdrop-blur-xl">
            Signature escape
          </div>
          <div className="rounded-full border border-white/18 bg-black/18 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/72 backdrop-blur-xl">
            {country}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="rounded-[24px] border border-white/12 bg-black/16 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#c4d3e6]">
              <MapPin className="size-3.5 text-[#00C2FF]" />
              {country}
            </div>
            <h3 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[2.1rem] font-bold tracking-[-0.05em] text-white">
              {title}
            </h3>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#E8F0FA]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2">
                <WalletCards className="size-4 text-[#00C2FF]" />
                {budget}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2">
                <CalendarDays className="size-4 text-[#00C2FF]" />
                {season}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
