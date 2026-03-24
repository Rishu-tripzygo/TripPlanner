"use client";

import StatusBadge from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export interface TripCardProps {
  id: string;
  title: string;
  description: string;
  startDate: Date | string;
  endDate: Date | string;
  imageUrl?: string | null;
  stops: number;
  status: "planning" | "upcoming" | "done" | "draft";
  destination?: string | null;
  budgetLabel?: string | null;
  aiReady?: boolean;
}

export default function TripCard({
  id,
  title,
  description,
  startDate,
  endDate,
  imageUrl,
  stops,
  status,
  destination,
  budgetLabel,
  aiReady,
}: TripCardProps) {
  return (
    <Link href={`/trips/${id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <Card className="group h-full overflow-hidden">
          <div className="relative h-56 overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(0,194,255,0.14),transparent_30%),linear-gradient(145deg,#dfeaf7,#f8f7f4)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#17375f]/88 via-[#17375f]/26 to-[rgba(255,255,255,0.04)]" />
            <div className="absolute left-5 top-5">
              <StatusBadge status={status} />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="max-w-[85%] text-2xl font-semibold tracking-[-0.03em] text-white drop-shadow-[0_8px_18px_rgba(0,0,0,0.28)]">
                {title}
              </h3>
            </div>
          </div>
          <CardContent className="space-y-4 pt-5">
            <p className="line-clamp-2 text-sm leading-7 text-[#61738C]">{description}</p>
            {destination || budgetLabel || aiReady ? (
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-[#7A8EA8]">
                {destination ? (
                  <span className="rounded-full bg-[#F4F3F1] px-3 py-1.5">{destination}</span>
                ) : null}
                {budgetLabel ? (
                  <span className="rounded-full bg-[#EEF2F8] px-3 py-1.5 text-[#14518b]">
                    {budgetLabel}
                  </span>
                ) : null}
                {aiReady ? (
                  <span className="rounded-full bg-[#EAF8F2] px-3 py-1.5 text-[#12715B]">
                    AI itinerary ready
                  </span>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#61738C]">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-[#00C2FF]" />
                {new Date(startDate).toLocaleDateString()} -{" "}
                {new Date(endDate).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-[#00C2FF]" />
                {stops} stop{stops === 1 ? "" : "s"}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
