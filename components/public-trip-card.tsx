"use client";

import { PublicTripCardRecord } from "@/lib/phase-one-types";
import { Button } from "@/components/ui/button";
import { Bookmark, Heart, MapPinned } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function PublicTripCard({
  trip,
}: {
  trip: PublicTripCardRecord;
}) {
  const [bookmarked, setBookmarked] = useState(Boolean(trip.isBookmarked));
  const [reacted, setReacted] = useState(Boolean(trip.hasReacted));
  const [bookmarkCount, setBookmarkCount] = useState(trip.bookmarksCount);
  const [reactionCount, setReactionCount] = useState(trip.reactionsCount);

  async function toggleAction(type: "bookmark" | "react") {
    const response = await fetch(`/api/explore/${trip.shareId}/${type}`, {
      method: "POST",
    });
    if (!response.ok) return;
    const data = (await response.json()) as { total: number; bookmarked?: boolean; reacted?: boolean };

    if (type === "bookmark") {
      setBookmarked(Boolean(data.bookmarked));
      setBookmarkCount(data.total);
    } else {
      setReacted(Boolean(data.reacted));
      setReactionCount(data.total);
    }
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-[rgba(2,71,133,0.08)] bg-white shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
      <div className="relative h-56">
        {trip.imageUrl ? (
          <Image src={trip.imageUrl} alt={trip.title} fill className="object-cover" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(0,194,255,0.12),transparent_30%),linear-gradient(145deg,#e4edf8,#f8f7f4)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A6B]/82 via-[#1B3A6B]/28 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            {trip.destination || "Public itinerary"}
          </p>
          <h3 className="mt-2 line-clamp-2 font-[family-name:var(--font-noto-serif)] text-[30px] font-bold tracking-[-0.04em] sm:text-[34px]">
            {trip.title}
          </h3>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link
              href={`/profile/${trip.author.username}`}
              className="text-sm font-medium text-[#024785] hover:underline"
            >
              {trip.author.name}
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#7A879B]">
              @{trip.author.username}
            </p>
          </div>
          <div className="rounded-full bg-[#F4F3F1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#024785]">
            {trip.travelStyle || "Curated"}
          </div>
        </div>

        <p className="line-clamp-3 text-sm leading-8 text-[#61738C]">{trip.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-sm text-[#61738C]">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F4F3F1] px-3 py-2">
            <MapPinned className="size-4 text-[#024785]" />
            {trip.stops} stops
          </span>
          <span className="rounded-full bg-[#F4F3F1] px-3 py-2">
            {new Date(trip.startDate).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link href={`/shared/${trip.token}`}>
            <Button className="w-full sm:w-auto">View trip</Button>
          </Link>
          <Link
            href={`/ai-trip-planner?destination=${encodeURIComponent(
              trip.destination || trip.title
            )}${trip.travelStyle ? `&style=${encodeURIComponent(trip.travelStyle)}` : ""}`}
          >
            <Button variant="outline" className="w-full sm:w-auto">Use this itinerary</Button>
          </Link>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => void toggleAction("bookmark")}>
            <Bookmark className={`size-4 ${bookmarked ? "fill-current" : ""}`} />
            {bookmarkCount}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => void toggleAction("react")}>
            <Heart className={`size-4 ${reacted ? "fill-current text-[#B84A43]" : ""}`} />
            {reactionCount}
          </Button>
        </div>
      </div>
    </div>
  );
}
