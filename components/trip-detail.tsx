"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Location, Trip } from "@/app/generated/prisma";
import CurrencyConverterWidget from "@/components/currency-converter-widget";
import DestinationNotesPanel from "@/components/destination-notes-panel";
import Map from "@/components/map";
import SortableItinerary from "@/components/sortable-itinerary";
import TripSharePanel from "@/components/trip-share-panel";
import StatusBadge from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DestinationForecast, PersistedItinerary } from "@/lib/phase-one-types";
import { cn } from "@/lib/utils";
import {
  BookOpenText,
  Calendar,
  CloudSun,
  Compass,
  FolderLock,
  Landmark,
  Package,
  Plus,
  TriangleAlert,
} from "lucide-react";

export type TripWithLocation = Trip & {
  locations: Location[];
};

function DetailMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[22px] border border-[rgba(2,71,133,0.08)] bg-white/88 p-5 shadow-[0_14px_28px_rgba(26,28,27,0.04)]">
      <p className="text-xs uppercase tracking-[0.24em] text-[#4A5568]">{label}</p>
      <p className="mt-3 font-[family-name:var(--font-noto-serif)] text-[34px] leading-none tracking-[-0.04em] text-[#024785]">
        {value}
      </p>
      <p className="mt-3 text-sm leading-7 text-[#61738C]">{note}</p>
    </div>
  );
}

export default function TripDetailClient({
  trip,
  activeItinerary,
}: {
  trip: TripWithLocation;
  activeItinerary?: PersistedItinerary | null;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [forecasts, setForecasts] = useState<DestinationForecast[]>([]);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  const status = useMemo(() => {
    const now = new Date();
    if (!activeItinerary && trip.locations.length === 0) return "draft";
    if (trip.endDate < now) return "done";
    if (trip.startDate >= now) return "upcoming";
    return "planning";
  }, [activeItinerary, trip.endDate, trip.locations.length, trip.startDate]);

  const duration = Math.max(
    1,
    Math.round(
      (trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const workflowScore = useMemo(() => {
    const shellReady = 1;
    const itineraryReady = activeItinerary ? 1 : 0;
    const routeReady = trip.locations.length > 0 ? 1 : 0;
    const prepReady = activeItinerary && trip.locations.length > 0 ? 1 : 0;
    return Math.round(((shellReady + itineraryReady + routeReady + prepReady) / 4) * 100);
  }, [activeItinerary, trip.locations.length]);

  useEffect(() => {
    let cancelled = false;

    async function loadForecasts() {
      setIsWeatherLoading(true);

      try {
        const response = await fetch(`/api/weather/trip/${trip.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load weather data.");
        }

        if (!cancelled) {
          setForecasts(data as DestinationForecast[]);
        }
      } catch {
        if (!cancelled) {
          setForecasts([]);
        }
      } finally {
        if (!cancelled) {
          setIsWeatherLoading(false);
        }
      }
    }

    void loadForecasts();

    return () => {
      cancelled = true;
    };
  }, [trip.id]);

  const tripDescription =
    trip.description?.trim() ||
    "This workspace holds your route, map, weather, budget, packing, documents, and share flow in one place.";

  const workflowSteps = [
    {
      title: "Trip shell",
      description: "Title, dates, and cover are already in place.",
      actionLabel: "Edit basics",
      actionHref: `/trips/${trip.id}`,
      complete: true,
    },
    {
      title: "AI itinerary",
      description: activeItinerary
        ? "An active itinerary version exists and can be refined."
        : "Generate the first itinerary draft to shape the route.",
      actionLabel: activeItinerary ? "Refine itinerary" : "Generate now",
      actionHref: `/ai-trip-planner?tripId=${trip.id}`,
      complete: Boolean(activeItinerary),
    },
    {
      title: "Mapped stops",
      description:
        trip.locations.length > 0
          ? `${trip.locations.length} route stop${trip.locations.length === 1 ? "" : "s"} added.`
          : "Add stops so the map, weather, and ordering become useful.",
      actionLabel: trip.locations.length > 0 ? "Manage stops" : "Add first stop",
      actionHref: `/trips/${trip.id}/itinerary/new`,
      complete: trip.locations.length > 0,
    },
    {
      title: "Travel prep",
      description:
        activeItinerary && trip.locations.length > 0
          ? "Budget, packing, documents, notes, and sharing are now meaningful."
          : "Prep becomes stronger after the itinerary and mapped route are ready.",
      actionLabel: activeItinerary && trip.locations.length > 0 ? "Open budget" : "Open workspace",
      actionHref: activeItinerary && trip.locations.length > 0 ? `/budget/${trip.id}` : `/trips/${trip.id}`,
      complete: Boolean(activeItinerary && trip.locations.length > 0),
    },
  ];

  return (
    <div className="app-shell space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[36px] border border-[rgba(2,71,133,0.08)] bg-white shadow-[0_28px_70px_rgba(26,28,27,0.08)]">
        <div className="relative min-h-[420px]">
          {trip.imageUrl ? (
            <Image src={trip.imageUrl} alt={trip.title} fill className="object-cover" priority />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(0,194,255,0.14),transparent_28%),linear-gradient(145deg,#e4edf8,#f8f7f4)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,34,66,0.12),rgba(14,34,66,0.58))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,194,255,0.22),transparent_36%)]" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
              <div className="space-y-4">
                <StatusBadge status={status} />
                <h1 className="max-w-4xl font-[family-name:var(--font-noto-serif)] text-[44px] leading-[0.95] tracking-[-0.05em] text-white sm:text-[58px] xl:text-[72px]">
                  {trip.title}
                </h1>
                <p className="flex items-center gap-2 text-sm text-[#E2ECF8]">
                  <Calendar className="size-4 text-[#00C2FF]" />
                  {trip.startDate.toLocaleDateString()} - {trip.endDate.toLocaleDateString()}
                </p>
                <p className="max-w-2xl text-sm leading-8 text-[#D6E1EF]">{tripDescription}</p>
              </div>

              <div className="grid gap-4 rounded-[28px] border border-white/12 bg-white/12 p-5 backdrop-blur-md sm:grid-cols-2">
                <DetailMetric
                  label="Workflow"
                  value={`${workflowScore}%`}
                  note="How complete this trip is as a usable, prep-ready workspace."
                />
                <DetailMetric
                  label="Route"
                  value={`${trip.locations.length}`}
                  note="Mapped stops attached to this trip and available on the map."
                />
                <DetailMetric
                  label="Duration"
                  value={`${duration}`}
                  note="Total days across this travel window."
                />
                <DetailMetric
                  label="Itinerary"
                  value={activeItinerary ? "Live" : "None"}
                  note={activeItinerary ? "An active AI itinerary is saved for this trip." : "Generate one to unlock the full flow."}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <Card className="border-[rgba(2,71,133,0.08)] bg-white/96">
          <CardHeader>
            <p className="section-label">Command Deck</p>
            <CardTitle className="font-[family-name:var(--font-noto-serif)] text-[34px] leading-[0.98] text-[#024785]">
              Move this trip through the right order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#F6F4EF] p-5">
              <p className="text-sm leading-7 text-[#61738C]">
                The clean Wandrly flow is: confirm the trip shell, generate the AI route, add
                mapped stops, then prep the trip with budget, packing, documents, and journaling.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {workflowSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#4A5568]">
                      Step {index + 1}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]",
                        step.complete
                          ? "border border-[#024785]/12 bg-white text-[#024785]"
                          : "border border-[rgba(2,71,133,0.08)] bg-[#F4F3F1] text-[#61738C]"
                      )}
                    >
                      {step.complete ? "Ready" : "Next"}
                    </span>
                  </div>
                  <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[28px] leading-[1.02] tracking-[-0.04em] text-[#1A1C1B]">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#61738C]">{step.description}</p>
                  <Link href={step.actionHref} className="mt-5 inline-flex">
                    <Button variant="outline">{step.actionLabel}</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[rgba(2,71,133,0.08)] bg-white/96">
          <CardHeader>
            <div className="flex flex-wrap gap-3">
              <Link href={`/budget/${trip.id}`}>
                <Button size="lg" variant="outline">
                  <Landmark className="size-4" />
                  Budget
                </Button>
              </Link>
              <Link href={`/packing/${trip.id}`}>
                <Button size="lg" variant="outline">
                  <Package className="size-4" />
                  Packing
                </Button>
              </Link>
              <Link href={`/documents/${trip.id}`}>
                <Button size="lg" variant="outline">
                  <FolderLock className="size-4" />
                  Documents
                </Button>
              </Link>
              <Link href={`/journal/${trip.id}`}>
                <Button size="lg" variant="outline">
                  <BookOpenText className="size-4" />
                  Journal
                </Button>
              </Link>
              <Link href={`/trips/${trip.id}/itinerary/new`}>
                <Button size="lg">
                  <Plus className="size-4" />
                  Add Location
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[#4A5568]">Primary destination</p>
              <p className="mt-3 text-lg font-semibold text-[#1A1C1B]">
                {trip.locations[0]?.locationTitle || "No route stops yet"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[#61738C]">
                The first mapped stop becomes the center of the workspace.
              </p>
            </div>
            <div className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[#4A5568]">Status</p>
              <p className="mt-3 text-lg font-semibold text-[#1A1C1B] capitalize">{status}</p>
              <p className="mt-2 text-sm leading-7 text-[#61738C]">
                Use this as the working state for planning, prep, and sharing.
              </p>
            </div>
            <div className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[#4A5568]">Next move</p>
              <p className="mt-3 text-lg font-semibold text-[#1A1C1B]">
                {activeItinerary ? "Refine or prep" : "Generate itinerary"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[#61738C]">
                {activeItinerary
                  ? "You can now move into budget, packing, docs, and final trip prep."
                  : "Create the first itinerary version to unlock the best flow."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-[30px] border border-[rgba(2,71,133,0.08)] bg-white/96 p-6 shadow-[0_24px_60px_rgba(26,28,27,0.06)]">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-[#F4F3F1] text-[#61738C]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="data-[state=active]:bg-white">
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-white">
              Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
              <div className="space-y-6">
                <div className="rounded-[28px] border border-[rgba(2,71,133,0.08)] bg-[#F6F4EF] p-6">
                  <p className="section-label">Trip Summary</p>
                  <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-4xl tracking-[-0.04em] text-[#024785]">
                    What this trip is becoming
                  </h2>
                  <p className="mt-4 text-sm leading-8 text-[#61738C]">{tripDescription}</p>
                  {activeItinerary ? (
                    <Link href={`/ai-trip-planner?tripId=${trip.id}`} className="mt-5 inline-flex">
                      <Button>
                        <Compass className="size-4" />
                        Refine AI itinerary
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/ai-trip-planner?tripId=${trip.id}`} className="mt-5 inline-flex">
                      <Button>
                        <Compass className="size-4" />
                        Generate AI itinerary
                      </Button>
                    </Link>
                  )}
                </div>

                <div className="rounded-[28px] border border-[rgba(2,71,133,0.08)] bg-white p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="section-label">Weather</p>
                      <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-4xl tracking-[-0.04em] text-[#024785]">
                        Destination forecast and season signals
                      </h2>
                    </div>
                    <div className="inline-flex rounded-2xl bg-[#EEF2F8] p-3 text-[#024785]">
                      <CloudSun className="size-5" />
                    </div>
                  </div>

                  {isWeatherLoading ? (
                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                      <div className="h-[220px] animate-pulse rounded-[18px] bg-[#F4F3F1]" />
                      <div className="h-[220px] animate-pulse rounded-[18px] bg-[#F4F3F1]" />
                    </div>
                  ) : forecasts.length > 0 ? (
                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                      {forecasts.map((forecast) => (
                        <div
                          key={forecast.destinationId}
                          className="rounded-[20px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-xl font-semibold text-[#1A1C1B]">
                                {forecast.destinationName}
                              </h3>
                              <p className="mt-2 text-sm text-[#61738C]">
                                {forecast.bestTimeToVisit.label} / best months{" "}
                                {forecast.bestTimeToVisit.bestMonths.join(", ")}
                              </p>
                            </div>
                            <span className="rounded-full border border-[#024785]/12 bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#024785]">
                              {Math.round(forecast.bestTimeToVisit.confidenceScore)}% fit
                            </span>
                          </div>

                          {forecast.alert ? (
                            <div className="mt-4 flex gap-3 rounded-[16px] border border-[#F59E0B]/20 bg-[#FFF7E6] p-4 text-sm leading-7 text-[#9A6700]">
                              <TriangleAlert className="mt-1 size-4 shrink-0 text-[#F59E0B]" />
                              <span>{forecast.alert}</span>
                            </div>
                          ) : null}

                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {forecast.forecast.map((day) => (
                              <div
                                key={`${forecast.destinationId}-${day.date}`}
                                className="rounded-[16px] border border-[rgba(2,71,133,0.08)] bg-white p-3"
                              >
                                <p className="text-xs uppercase tracking-[0.18em] text-[#4A5568]">
                                  {new Date(`${day.date}T00:00:00.000Z`).toLocaleDateString()}
                                </p>
                                <p className="mt-2 text-sm font-medium text-[#1A1C1B]">
                                  {day.summary}
                                </p>
                                <p className="mt-1 text-sm text-[#61738C]">
                                  {day.temperatureMin}C - {day.temperatureMax}C
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-[18px] border border-dashed border-[rgba(2,71,133,0.12)] bg-[#FAF9F7] p-5 text-sm leading-7 text-[#61738C]">
                      Weather data is not available yet for this trip. Forecasts appear once we
                      have destination coordinates and a valid travel window.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="h-[420px] overflow-hidden rounded-[28px] border border-[rgba(2,71,133,0.08)]">
                  <Map itineraries={trip.locations} />
                </div>

                {activeItinerary ? (
                  <div className="rounded-[28px] border border-[rgba(2,71,133,0.08)] bg-white p-6">
                    <p className="section-label">AI Weather Outlook</p>
                    <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-4xl tracking-[-0.04em] text-[#024785]">
                      Day-by-day AI itinerary weather
                    </h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {activeItinerary.days.map((day) => (
                        <div
                          key={day.day}
                          className="rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-5"
                        >
                          <p className="text-xs uppercase tracking-[0.22em] text-[#4A5568]">
                            Day {day.day}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-[#1A1C1B]">{day.title}</h3>
                          {day.weather ? (
                            <p className="mt-3 text-sm leading-7 text-[#61738C]">
                              {day.weather.summary} / {day.weather.temperatureMin}C to {day.weather.temperatureMax}C
                            </p>
                          ) : (
                            <p className="mt-3 text-sm leading-7 text-[#61738C]">
                              Weather badge will appear once the itinerary has weather context.
                            </p>
                          )}
                          {day.destinationSeason ? (
                            <div className="mt-4 inline-flex rounded-full border border-[#024785]/12 bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#024785]">
                              {day.destinationSeason.label}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <CurrencyConverterWidget
                  destinations={trip.locations.map((location) => location.locationTitle)}
                  defaultFrom={activeItinerary?.total_estimated_cost?.currency || "INR"}
                  suggestedAmount={activeItinerary?.total_estimated_cost?.total || 10000}
                  title="Local currency preview"
                />

                <TripSharePanel tripId={trip.id} tripTitle={trip.title} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="itinerary">
            <div className="space-y-6">
              {trip.locations.length > 0 ? (
                <SortableItinerary locations={trip.locations} tripId={trip.id} />
              ) : (
                <div className="rounded-[20px] border border-dashed border-[rgba(2,71,133,0.12)] bg-[#FAF9F7] p-8 text-center text-[#61738C]">
                  Add locations to build your itinerary.
                </div>
              )}

              <DestinationNotesPanel locations={trip.locations} />
            </div>
          </TabsContent>

          <TabsContent value="map">
            <div className="space-y-6">
              <div className="h-[520px] overflow-hidden rounded-[28px] border border-[rgba(2,71,133,0.08)]">
                <Map itineraries={trip.locations} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {trip.locations.length > 0 ? (
                  trip.locations.map((location, index) => (
                    <div
                      key={location.id}
                      className="rounded-[20px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-5"
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-[#4A5568]">
                        Stop {index + 1}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[#1A1C1B]">
                        {location.locationTitle}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[#61738C]">
                        A mapped route stop connected to this trip workspace.
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-dashed border-[rgba(2,71,133,0.12)] bg-[#FAF9F7] p-8 text-center text-[#61738C]">
                    No mapped stops yet. Add the first destination to activate the route.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
