"use client";

import { Location, Trip } from "@/app/generated/prisma";
import Image from "next/image";
import { Calendar, Compass, MapPin, Plus, Route, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState } from "react";
import Map from "@/components/map";
import SortableItinerary from "./sortable-itinerary";

export type TripWithLocation = Trip & {
  locations: Location[];
};

interface TripDetailClientProps {
  trip: TripWithLocation;
}

export default function TripDetailClient({ trip }: TripDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const tripLength = Math.max(
    1,
    Math.round(
      (trip.endDate.getTime() - trip.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.10),_transparent_20%),linear-gradient(180deg,_#f9fbff_0%,_#ffffff_40%,_#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {trip.imageUrl ? (
          <div className="relative h-80 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-sky-200/50 md:h-[28rem]">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/70 via-slate-900/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-4 p-8 text-white md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-sky-200">
                  Saved Journey
                </p>
                <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
                  {trip.title}
                </h1>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-200">
                  <Calendar className="h-4 w-4" />
                  {trip.startDate.toLocaleDateString()} -{" "}
                  {trip.endDate.toLocaleDateString()}
                </div>
              </div>
              <Link href={`/trips/${trip.id}/itinerary/new`}>
                <Button className="rounded-full bg-white px-6 text-slate-950 hover:bg-sky-50">
                  <Plus className="mr-2 h-5 w-5" /> Add Location
                </Button>
              </Link>
            </div>
            <Image
              src={trip.imageUrl}
              alt={trip.title}
              className="object-cover"
              fill
              priority
            />
          </div>
        ) : (
          <div className="rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-2xl shadow-sky-200/40">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-sky-200">
                  Saved Journey
                </p>
                <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
                  {trip.title}
                </h1>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-200">
                  <Calendar className="h-4 w-4" />
                  {trip.startDate.toLocaleDateString()} -{" "}
                  {trip.endDate.toLocaleDateString()}
                </div>
              </div>
              <Link href={`/trips/${trip.id}/itinerary/new`}>
                <Button className="rounded-full bg-white px-6 text-slate-950 hover:bg-sky-50">
                  <Plus className="mr-2 h-5 w-5" /> Add Location
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <Calendar className="size-5" />,
              label: "Duration",
              value: `${tripLength} day${tripLength === 1 ? "" : "s"}`,
            },
            {
              icon: <MapPin className="size-5" />,
              label: "Destinations",
              value: `${trip.locations.length} location${trip.locations.length === 1 ? "" : "s"}`,
            },
            {
              icon: <Compass className="size-5" />,
              label: "Trip Mode",
              value: trip.locations.length > 0 ? "Active route mapped" : "Ready to build",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-lg shadow-sky-100/60"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-sky-100 p-3 text-sky-700">
                {item.icon}
              </div>
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-xl shadow-sky-100/70">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 rounded-full bg-slate-100 p-1">
              <TabsTrigger value="overview" className="rounded-full px-5 text-base">
                Overview
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="rounded-full px-5 text-base">
                Itinerary
              </TabsTrigger>
              <TabsTrigger value="map" className="rounded-full px-5 text-base">
                Map
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[1.75rem] bg-slate-50 p-6">
                  <div className="mb-4 inline-flex rounded-2xl bg-white p-3 text-sky-700 shadow-sm">
                    <Sparkles className="size-5" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-950">
                    Trip Summary
                  </h2>
                  <p className="mt-4 leading-8 text-slate-600">
                    {trip.description}
                  </p>
                  <div className="mt-6 grid gap-4">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-sm font-medium text-slate-500">Dates</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        {trip.startDate.toLocaleDateString()} -{" "}
                        {trip.endDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-sm font-medium text-slate-500">Destinations</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        {trip.locations.length} location
                        {trip.locations.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-80 overflow-hidden rounded-[1.75rem] shadow-lg shadow-sky-100/60">
                    <Map itineraries={trip.locations} />
                  </div>
                  {trip.locations.length === 0 && (
                    <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                      <p className="text-slate-600">Add locations to see them on the map.</p>
                      <Link href={`/trips/${trip.id}/itinerary/new`}>
                        <Button className="mt-4 rounded-full">
                          <Plus className="mr-2 h-5 w-5" /> Add Location
                        </Button>
                      </Link>
                    </div>
                  )}
                  <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white">
                    <div className="mb-3 inline-flex rounded-2xl bg-white/10 p-3">
                      <Route className="size-5" />
                    </div>
                    <h3 className="text-xl font-semibold">Route Mood</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      Use the itinerary tab to drag stops into a more natural sequence,
                      then return here to review the route spatially.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="itinerary" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-950">
                  Full Itinerary
                </h2>
              </div>

              {trip.locations.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-slate-600">
                    Add locations to see them on the itinerary.
                  </p>
                  <Link href={`/trips/${trip.id}/itinerary/new`}>
                    <Button className="mt-4 rounded-full">
                      <Plus className="mr-2 h-5 w-5" /> Add Location
                    </Button>
                  </Link>
                </div>
              ) : (
                <SortableItinerary locations={trip.locations} tripId={trip.id} />
              )}
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
              <div className="h-[28rem] overflow-hidden rounded-[1.75rem] shadow-lg shadow-sky-100/60">
                <Map itineraries={trip.locations} />
              </div>
              {trip.locations.length === 0 && (
                <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-slate-600">Add locations to see them on the map.</p>
                  <Link href={`/trips/${trip.id}/itinerary/new`}>
                    <Button className="mt-4 rounded-full">
                      <Plus className="mr-2 h-5 w-5" /> Add Location
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-center">
          <Link href="/trips">
            <Button
              variant="outline"
              className="rounded-full border-slate-300 bg-white/80 px-6"
            >
              Back to Trips
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
