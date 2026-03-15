"use client";

import { Location, Trip } from "@/app/generated/prisma";
import StatusBadge from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Map from "@/components/map";
import SortableItinerary from "@/components/sortable-itinerary";
import { Calendar, Compass, MapPinned, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type TripWithLocation = Trip & {
  locations: Location[];
};

export default function TripDetailClient({ trip }: { trip: TripWithLocation }) {
  const [activeTab, setActiveTab] = useState("overview");

  const status = useMemo(() => {
    const now = new Date();
    if (trip.endDate < now) return "done";
    if (trip.startDate >= now) return "upcoming";
    return "planning";
  }, [trip.endDate, trip.startDate]);

  const duration = Math.max(
    1,
    Math.round(
      (trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div className="app-shell space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border border-white/8 bg-[#0F1117] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_40px_rgba(0,0,0,0.6)]">
        <div className="relative h-[360px]">
          {trip.imageUrl ? (
            <Image src={trip.imageUrl} alt={trip.title} fill className="object-cover" priority />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(0,194,255,0.16),transparent_28%),linear-gradient(145deg,#161820,#08090E)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090E] via-[#08090E]/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-8 md:flex-row md:items-end md:justify-between">
            <div>
              <StatusBadge status={status} />
              <h1 className="mt-4 text-[42px] font-semibold tracking-[-0.05em] text-white sm:text-[58px]">
                {trip.title}
              </h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-[#D8E2F1]">
                <Calendar className="size-4 text-[#00C2FF]" />
                {trip.startDate.toLocaleDateString()} - {trip.endDate.toLocaleDateString()}
              </p>
            </div>
            <Link href={`/trips/${trip.id}/itinerary/new`}>
              <Button size="lg">
                <Plus className="size-4" />
                Add Location
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          ["Duration", `${duration} days`, <Calendar className="size-5" key="cal" />],
          [
            "Destinations",
            `${trip.locations.length} stop${trip.locations.length === 1 ? "" : "s"}`,
            <MapPinned className="size-5" key="pin" />,
          ],
          [
            "Trip Mood",
            trip.locations.length > 0 ? "Mapped and editable" : "Ready to build",
            <Compass className="size-5" key="comp" />,
          ],
        ].map(([label, value, icon]) => (
          <div
            key={label as string}
            className="rounded-[24px] border border-white/8 bg-[#0F1117] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_24px_rgba(0,0,0,0.4)]"
          >
            <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
              {icon}
            </div>
            <p className="text-sm text-[#8B9BB4]">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-[24px] border border-white/8 bg-[#0F1117] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_24px_rgba(0,0,0,0.4)]">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
              <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-6">
                <p className="section-label">Summary</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                  Trip details
                </h2>
                <p className="mt-4 text-sm leading-8 text-[#8B9BB4]">{trip.description}</p>
              </div>
              <div className="h-[420px] overflow-hidden rounded-[20px] border border-white/8">
                <Map itineraries={trip.locations} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="itinerary">
            {trip.locations.length > 0 ? (
              <SortableItinerary locations={trip.locations} tripId={trip.id} />
            ) : (
              <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-[#8B9BB4]">
                Add locations to build your itinerary.
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <div className="h-[520px] overflow-hidden rounded-[20px] border border-white/8">
              <Map itineraries={trip.locations} />
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
