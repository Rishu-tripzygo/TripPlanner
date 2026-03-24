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
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="w-full"
    >
      <div className="group relative mx-auto h-[340px] w-full overflow-hidden rounded-[34px] border border-white/55 bg-white/28 shadow-[0_28px_60px_rgba(22,40,64,0.16)] backdrop-blur-xl">
        <motion.div
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,43,77,0.08),rgba(13,43,77,0.22)_30%,rgba(13,43,77,0.78)_100%)]" />
        <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3">
          <div className="rounded-full border border-white/22 bg-white/14 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/88 backdrop-blur-xl">
            Featured escape
          </div>
          <div className="rounded-full border border-white/22 bg-white/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/82 backdrop-blur-xl">
            {country}
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-5">
          <div className="rounded-[26px] border border-white/20 bg-[rgba(255,255,255,0.14)] p-5 shadow-[0_18px_40px_rgba(6,24,46,0.18)] backdrop-blur-[26px]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/72">
              <MapPin className="size-3.5 text-[#8fe4ff]" />
              {country}
            </div>
            <h3 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[2.15rem] font-bold tracking-[-0.05em] text-white">
              {title}
            </h3>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/12 px-3.5 py-2 backdrop-blur-xl">
                <WalletCards className="size-4 text-[#8fe4ff]" />
                {budget}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/12 px-3.5 py-2 backdrop-blur-xl">
                <CalendarDays className="size-4 text-[#8fe4ff]" />
                {season}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
