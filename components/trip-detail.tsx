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
import { Card, CardContent } from "@/components/ui/card";
import { DestinationForecast, PersistedItinerary } from "@/lib/phase-one-types";
import { cn } from "@/lib/utils";
import {
  BookOpenText,
  Calendar,
  CheckCircle2,
  CloudSun,
  Compass,
  FileText,
  FolderLock,
  Landmark,
  MapPinned,
  Package,
  Route,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

export type TripWithLocation = Trip & {
  locations: Location[];
};

type PrepCard = {
  title: string;
  href: string;
  status: string;
  note: string;
  icon: typeof Landmark;
};

export default function TripDetailClient({
  trip,
  activeItinerary,
}: {
  trip: TripWithLocation;
  activeItinerary?: PersistedItinerary | null;
}) {
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
    "Wandrly keeps the route, itinerary, budget, weather, packing, documents, and sharing flow connected in one place.";

  const progressSteps = useMemo(
    () => [
      {
        key: "plan",
        label: "Plan",
        icon: Sparkles,
        complete: true,
        active: !activeItinerary,
        href: `/ai-trip-planner?tripId=${trip.id}`,
      },
      {
        key: "route",
        label: "Route",
        icon: Route,
        complete: trip.locations.length > 0,
        active: Boolean(activeItinerary) && trip.locations.length === 0,
        href: `/ai-trip-planner?tripId=${trip.id}`,
      },
      {
        key: "customize",
        label: "Customize",
        icon: Compass,
        complete: Boolean(activeItinerary),
        active: Boolean(activeItinerary),
        href: `/ai-trip-planner?tripId=${trip.id}`,
      },
      {
        key: "prepare",
        label: "Prepare",
        icon: Package,
        complete: Boolean(activeItinerary && trip.locations.length > 0),
        active: Boolean(activeItinerary && trip.locations.length > 0),
        href: `/budget/${trip.id}`,
      },
      {
        key: "ready",
        label: "Ready",
        icon: CheckCircle2,
        complete: workflowScore >= 100,
        active: workflowScore >= 100,
        href: `/trips/${trip.id}`,
      },
    ],
    [activeItinerary, trip.id, trip.locations.length, workflowScore]
  );

  const nextAction = useMemo(() => {
    if (!activeItinerary) {
      return {
        title: "Generate the trip plan",
        description:
          "Start with Wandrly AI so the itinerary, hotels, budget context, and highlights appear automatically inside this trip.",
        href: `/ai-trip-planner?tripId=${trip.id}`,
        label: "Generate itinerary",
      };
    }

    if (trip.locations.length === 0) {
      return {
        title: "Review the AI route suggestions",
        description:
          "Wandrly already has suggested places from the itinerary. Refine or confirm those first instead of building the route manually.",
        href: `/ai-trip-planner?tripId=${trip.id}`,
        label: "Review AI itinerary",
      };
    }

    return {
      title: "Start trip preparation",
      description:
        "The AI plan and route are in place. Move into budget, packing, documents, and notes to get the trip ready.",
      href: `/budget/${trip.id}`,
      label: "Continue planning",
    };
  }, [activeItinerary, trip.id, trip.locations.length]);

  const prepCards = useMemo<PrepCard[]>(
    () => [
      {
        title: "Budget",
        href: `/budget/${trip.id}`,
        status: activeItinerary?.total_estimated_cost ? "Estimated" : "Start here",
        note: activeItinerary?.total_estimated_cost
          ? `${activeItinerary.total_estimated_cost.currency} ${activeItinerary.total_estimated_cost.total.toLocaleString()} estimated`
          : "Create a cost view for the trip.",
        icon: Landmark,
      },
      {
        title: "Packing",
        href: `/packing/${trip.id}`,
        status: activeItinerary && trip.locations.length > 0 ? "Ready" : "Waiting on route",
        note:
          activeItinerary && trip.locations.length > 0
            ? "Build the checklist for this itinerary."
            : "Works best after itinerary and stops are confirmed.",
        icon: Package,
      },
      {
        title: "Documents",
        href: `/documents/${trip.id}`,
        status: "Pending",
        note: "Keep tickets, visas, and confirmations in one place.",
        icon: FolderLock,
      },
      {
        title: "Journal",
        href: `/journal/${trip.id}`,
        status: "Optional",
        note: "Capture notes, photos, and daily memories.",
        icon: BookOpenText,
      },
    ],
    [activeItinerary, trip.id, trip.locations.length]
  );

  const weatherSummary = forecasts[0];
  const primaryDestination =
    trip.locations[0]?.locationTitle || activeItinerary?.trip_summary.destination || "Destination";
  const suggestedStops = useMemo(
    () =>
      Array.from(
        new Set(
          (activeItinerary?.days ?? [])
            .flatMap((day) => day.places || [])
            .map((place) => place.trim())
            .filter(Boolean)
        )
      ).slice(0, 8),
    [activeItinerary]
  );

  return (
    <div className="app-shell space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[38px] border border-[rgba(2,71,133,0.08)] bg-white shadow-[0_28px_80px_rgba(26,28,27,0.08)]">
        <div className="relative min-h-[420px]">
          {trip.imageUrl ? (
            <Image src={trip.imageUrl} alt={trip.title} fill className="object-cover" priority />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(0,194,255,0.16),transparent_30%),linear-gradient(145deg,#e4edf8,#f8f7f4)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,34,66,0.08),rgba(14,34,66,0.62))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,194,255,0.22),transparent_38%)]" />

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
              <div className="space-y-4 text-white">
                <StatusBadge status={status} />
                <h1 className="max-w-4xl font-[family-name:var(--font-noto-serif)] text-[42px] leading-[0.95] tracking-[-0.05em] sm:text-[58px] xl:text-[72px]">
                  {trip.title}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm text-[#E2ECF8]">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                    <Calendar className="size-4 text-[#00C2FF]" />
                    {trip.startDate.toLocaleDateString()} - {trip.endDate.toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                    <Route className="size-4 text-[#00C2FF]" />
                    {duration} day{duration === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                    <MapPinned className="size-4 text-[#00C2FF]" />
                    {trip.locations.length} stop{trip.locations.length === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="max-w-2xl text-sm leading-8 text-[#D6E1EF]">{tripDescription}</p>
              </div>

              <div className="rounded-[30px] border border-white/18 bg-white/14 p-5 text-white backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.22em] text-white/68">Continue planning</p>
                <p className="mt-3 font-[family-name:var(--font-noto-serif)] text-[30px] leading-[1.02] tracking-[-0.04em]">
                  Keep this trip moving in the right order.
                </p>
                <p className="mt-3 text-sm leading-7 text-white/78">
                  Use the AI plan, confirm your route, then move into prep once the trip shape feels right.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link href={nextAction.href}>
                    <Button className="w-full rounded-full sm:w-auto">{nextAction.label}</Button>
                  </Link>
                  <Link href={`/ai-trip-planner?tripId=${trip.id}`}>
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-white/30 bg-white/10 text-white hover:bg-white/18 sm:w-auto"
                    >
                      Refine with AI
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-[rgba(2,71,133,0.08)] bg-white/88 p-5 shadow-[0_24px_60px_rgba(26,28,27,0.05)] sm:p-6">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2">
          {progressSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex min-w-[152px] items-center gap-3">
                <Link href={step.href} className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className={cn(
                      "inline-flex size-12 shrink-0 items-center justify-center rounded-full border transition",
                      step.complete
                        ? "border-[#14518b]/15 bg-[#eaf4ff] text-[#14518b]"
                        : step.active
                          ? "border-[#14518b]/18 bg-[#14518b] text-white"
                          : "border-[rgba(2,71,133,0.08)] bg-[#F6F4EF] text-[#7a8ea8]"
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#8A96A8]">
                      {step.complete ? "Completed" : step.active ? "Current" : "Next"}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-[#1A1C1B]">{step.label}</p>
                  </div>
                </Link>
                {index < progressSteps.length - 1 ? (
                  <div className="hidden h-[2px] w-10 rounded-full bg-[#dbe7f5] md:block" />
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[32px] border border-[rgba(2,71,133,0.08)] bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(240,247,255,0.9))] p-6 shadow-[0_24px_60px_rgba(26,28,27,0.05)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-label">What should you do next?</p>
            <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[34px] leading-[0.98] tracking-[-0.04em] text-[#024785] sm:text-[42px]">
              {nextAction.title}
            </h2>
            <p className="mt-4 text-sm leading-8 text-[#61738C]">{nextAction.description}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={nextAction.href}>
              <Button className="rounded-full px-7">{nextAction.label}</Button>
            </Link>
            <Link href={`/ai-trip-planner?tripId=${trip.id}`}>
              <Button variant="outline" className="rounded-full px-7">
                Refine with AI
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-6">
          <Card className="border-[rgba(2,71,133,0.08)] bg-white/96">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="section-label">Trip Summary</p>
                  <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[34px] leading-[0.98] tracking-[-0.04em] text-[#024785]">
                    Everything already connected to this trip
                  </h2>
                </div>
                <div className="rounded-[22px] border border-[rgba(2,71,133,0.08)] bg-[#EEF7FD] px-4 py-3 text-sm text-[#024785]">
                  Workspace {workflowScore}% ready
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <InfoTile
                  label="Primary destination"
                  value={primaryDestination}
                  note="The lead stop anchors the map and local context."
                />
                <InfoTile
                  label="AI itinerary"
                  value={activeItinerary ? `${activeItinerary.days.length} planned days` : "Not generated yet"}
                  note={
                    activeItinerary
                      ? "Highlights, hotels, food, and budget context are already attached."
                      : "Generate one to populate the workspace automatically."
                  }
                />
                <InfoTile
                  label="Estimated total"
                  value={
                    activeItinerary?.total_estimated_cost
                      ? `${activeItinerary.total_estimated_cost.currency} ${activeItinerary.total_estimated_cost.total.toLocaleString()}`
                      : "Add itinerary first"
                  }
                  note="Budget gets seeded from the AI plan and can be refined later."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[rgba(2,71,133,0.08)] bg-white/96">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-label">Itinerary Snapshot</p>
                  <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[34px] leading-[0.98] tracking-[-0.04em] text-[#024785]">
                    What the current trip looks like
                  </h2>
                </div>
                <Link href={`/ai-trip-planner?tripId=${trip.id}`}>
                  <Button variant="outline" className="rounded-full">
                    <Compass className="size-4" />
                    {activeItinerary ? "Refine itinerary" : "Generate itinerary"}
                  </Button>
                </Link>
              </div>

              {activeItinerary ? (
                <div className="grid gap-4">
                  {activeItinerary.days.slice(0, 3).map((day) => (
                    <div key={day.day} className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-[#4A5568]">Day {day.day}</p>
                          <h3 className="mt-2 text-xl font-semibold text-[#1A1C1B]">{day.title}</h3>
                        </div>
                        {day.estimatedCost ? (
                          <div className="rounded-full border border-[#14518b]/12 bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#14518b]">
                            {day.estimatedCost.currency} {day.estimatedCost.total}
                          </div>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[#61738C]">
                        {[...day.morning.slice(0, 1), ...day.afternoon.slice(0, 1), ...day.evening.slice(0, 1)]
                          .filter(Boolean)
                          .join(" / ") || "Day details ready to refine."}
                      </p>
                    </div>
                  ))}

                  {activeItinerary.days.length > 3 ? (
                    <p className="text-sm text-[#61738C]">
                      + {activeItinerary.days.length - 3} more planned day
                      {activeItinerary.days.length - 3 === 1 ? "" : "s"} in the full AI itinerary.
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-[rgba(2,71,133,0.12)] bg-[#FAF9F7] p-6 text-sm leading-7 text-[#61738C]">
                  No AI itinerary is attached yet. Generate one and Wandrly will automatically seed the trip with a day-wise plan, hotel recommendations, budget context, and highlights.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[rgba(2,71,133,0.08)] bg-white/96">
            <CardContent className="space-y-5 p-6">
              <div>
                <p className="section-label">Travel Prep</p>
                <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[34px] leading-[0.98] tracking-[-0.04em] text-[#024785]">
                  Get the trip ready step by step
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {prepCards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="rounded-[22px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(26,28,27,0.06)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="inline-flex rounded-2xl bg-white p-3 text-[#14518b] shadow-[0_10px_22px_rgba(20,81,139,0.08)]">
                          <Icon className="size-5" />
                        </div>
                        <span className="rounded-full border border-[rgba(2,71,133,0.08)] bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#61738C]">
                          {item.status}
                        </span>
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-[#1A1C1B]">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[#61738C]">{item.note}</p>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[rgba(2,71,133,0.08)] bg-white/96">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-label">Route Builder</p>
                  <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[34px] leading-[0.98] tracking-[-0.04em] text-[#024785]">
                    Confirm the stops on the actual route
                  </h2>
                </div>
                <Link href={`/ai-trip-planner?tripId=${trip.id}`}>
                  <Button className="rounded-full">
                    <Compass className="size-4" />
                    Refine route with AI
                  </Button>
                </Link>
              </div>

              {trip.locations.length > 0 ? (
                <SortableItinerary locations={trip.locations} tripId={trip.id} />
              ) : (
                <div className="space-y-4 rounded-[22px] border border-dashed border-[rgba(2,71,133,0.12)] bg-[#FAF9F7] p-6">
                  <p className="text-sm leading-7 text-[#61738C]">
                    No confirmed route stops yet. Wandrly can already see suggestions from the saved AI itinerary, so you do not need to build the route from scratch.
                  </p>
                  {suggestedStops.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {suggestedStops.map((stop) => (
                        <span
                          key={stop}
                          className="rounded-full border border-[#14518b]/10 bg-white px-3 py-1.5 text-sm text-[#46617c]"
                        >
                          {stop}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[rgba(2,71,133,0.08)] bg-white/96">
            <CardContent className="p-6">
              <div>
                <p className="section-label">Notes</p>
                <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[34px] leading-[0.98] tracking-[-0.04em] text-[#024785]">
                  Keep ideas and context with the route
                </h2>
              </div>
              <div className="mt-5">
                <DestinationNotesPanel locations={trip.locations} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="xl:sticky xl:top-24">
            <Card className="overflow-hidden border-[rgba(2,71,133,0.08)] bg-white/96">
              <CardContent className="space-y-5 p-0">
                <div className="flex items-center justify-between gap-4 px-6 pt-6">
                  <div>
                    <p className="section-label">Route Map</p>
                    <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[34px] leading-[0.98] tracking-[-0.04em] text-[#024785]">
                      See the trip shape on the map
                    </h2>
                  </div>
                  <div className="rounded-full border border-[rgba(2,71,133,0.08)] bg-[#F6F4EF] px-4 py-2 text-sm text-[#61738C]">
                    {trip.locations.length > 0
                      ? `${trip.locations.length} mapped stop${trip.locations.length === 1 ? "" : "s"}`
                      : "No stops yet"}
                  </div>
                </div>

                <div className="h-[420px] overflow-hidden border-y border-[rgba(2,71,133,0.08)]">
                  {trip.locations.length > 0 ? (
                    <Map itineraries={trip.locations} />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[linear-gradient(145deg,#f4f8fb,#f7f4ef)] p-8 text-center">
                      <MapPinned className="size-10 text-[#14518b]" />
                      <div>
                        <p className="text-lg font-semibold text-[#1A1C1B]">Confirm AI route suggestions</p>
                        <p className="mt-2 max-w-sm text-sm leading-7 text-[#61738C]">
                          The map turns on once route stops are confirmed. Start from the AI itinerary suggestions instead of entering destinations manually.
                        </p>
                      </div>
                      {suggestedStops.length > 0 ? (
                        <div className="flex max-w-md flex-wrap justify-center gap-2">
                          {suggestedStops.slice(0, 5).map((stop) => (
                            <span
                              key={stop}
                              className="rounded-full border border-[#14518b]/10 bg-white px-3 py-1.5 text-sm text-[#46617c]"
                            >
                              {stop}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <Link href={`/ai-trip-planner?tripId=${trip.id}`}>
                        <Button className="rounded-full">Review AI itinerary</Button>
                      </Link>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 px-6 pb-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <InsightCard
                      icon={CloudSun}
                      title="Weather"
                      description={
                        isWeatherLoading
                          ? "Loading forecast..."
                          : weatherSummary
                            ? `${weatherSummary.destinationName}: ${weatherSummary.bestTimeToVisit.label}`
                            : "Weather appears once destination data is available."
                      }
                    />
                    <InsightCard
                      icon={Landmark}
                      title="Budget estimate"
                      description={
                        activeItinerary?.total_estimated_cost
                          ? `${activeItinerary.total_estimated_cost.currency} ${activeItinerary.total_estimated_cost.total.toLocaleString()}`
                          : "Generate an itinerary to seed a cost view."
                      }
                    />
                    <InsightCard
                      icon={FileText}
                      title="Highlights"
                      description={
                        activeItinerary?.must_visit_attractions?.[0] ||
                        "Must-see moments will appear from the AI plan."
                      }
                    />
                  </div>

                  <CurrencyConverterWidget
                    destinations={trip.locations.map((location) => location.locationTitle)}
                    defaultFrom={activeItinerary?.total_estimated_cost?.currency || "INR"}
                    suggestedAmount={activeItinerary?.total_estimated_cost?.total || 10000}
                    title="Local currency preview"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <Card className="border-[rgba(2,71,133,0.08)] bg-white/96">
          <CardContent className="space-y-5 p-6">
            <div>
              <p className="section-label">Destination Forecast</p>
              <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[34px] leading-[0.98] tracking-[-0.04em] text-[#024785]">
                Weather and season signals
              </h2>
            </div>

            {isWeatherLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-[220px] animate-pulse rounded-[18px] bg-[#F4F3F1]" />
                <div className="h-[220px] animate-pulse rounded-[18px] bg-[#F4F3F1]" />
              </div>
            ) : forecasts.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {forecasts.map((forecast) => (
                  <div
                    key={forecast.destinationId}
                    className="rounded-[22px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-[#1A1C1B]">{forecast.destinationName}</h3>
                        <p className="mt-2 text-sm text-[#61738C]">
                          {forecast.bestTimeToVisit.label} / best months {forecast.bestTimeToVisit.bestMonths.join(", ")}
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
                          <p className="mt-2 text-sm font-medium text-[#1A1C1B]">{day.summary}</p>
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
              <div className="rounded-[18px] border border-dashed border-[rgba(2,71,133,0.12)] bg-[#FAF9F7] p-5 text-sm leading-7 text-[#61738C]">
                Weather data is not available yet for this trip. Forecasts appear once we have destination coordinates and a valid travel window.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[rgba(2,71,133,0.08)] bg-white/96">
          <CardContent className="space-y-5 p-6">
            <div>
              <p className="section-label">Share</p>
              <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[34px] leading-[0.98] tracking-[-0.04em] text-[#024785]">
                Share only after the trip feels ready
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#61738C]">
                Keep this secondary until the route and prep feel solid. Then publish a polished version or invite collaborators.
              </p>
            </div>
            <TripSharePanel tripId={trip.id} tripTitle={trip.title} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function InfoTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[22px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-[#4A5568]">{label}</p>
      <p className="mt-3 text-lg font-semibold text-[#1A1C1B]">{value}</p>
      <p className="mt-2 text-sm leading-7 text-[#61738C]">{note}</p>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof CloudSun;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
      <div className="inline-flex rounded-2xl bg-white p-3 text-[#14518b] shadow-[0_10px_22px_rgba(20,81,139,0.08)]">
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-[#1A1C1B]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[#61738C]">{description}</p>
    </div>
  );
}
