"use client";

import { Location, Trip } from "@/app/generated/prisma";
import { DestinationForecast, PersistedItinerary } from "@/lib/phase-one-types";
import StatusBadge from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Map from "@/components/map";
import SortableItinerary from "@/components/sortable-itinerary";
import DestinationNotesPanel from "@/components/destination-notes-panel";
import CurrencyConverterWidget from "@/components/currency-converter-widget";
import TripSharePanel from "@/components/trip-share-panel";
import {
  Calendar,
  CloudSun,
  Compass,
  FolderLock,
  BookOpenText,
  Landmark,
  MapPinned,
  Package,
  Plus,
  TriangleAlert,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type TripWithLocation = Trip & {
  locations: Location[];
};

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

            <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-label">Weather</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                    Destination forecast and season signals
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-8 text-[#8B9BB4]">
                    Seven-day forecast windows come from Open-Meteo when available. We also
                    surface seasonal guidance to flag rain-heavy or heat-heavy travel windows.
                  </p>
                </div>
                <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                  <CloudSun className="size-5" />
                </div>
              </div>

              {isWeatherLoading ? (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="h-[220px] animate-pulse rounded-[18px] border border-white/8 bg-white/[0.03]" />
                  <div className="h-[220px] animate-pulse rounded-[18px] border border-white/8 bg-white/[0.03]" />
                </div>
              ) : forecasts.length > 0 ? (
                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {forecasts.map((forecast) => (
                    <div
                      key={forecast.destinationId}
                      className="rounded-[18px] border border-white/8 bg-[#0F1117] p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {forecast.destinationName}
                          </h3>
                          <p className="mt-2 text-sm text-[#8B9BB4]">
                            {forecast.bestTimeToVisit.label} · best months{" "}
                            {forecast.bestTimeToVisit.bestMonths.join(", ")}
                          </p>
                        </div>
                        <span className="rounded-full border border-[#00C2FF]/20 bg-[#00C2FF]/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#D8E2F1]">
                          {Math.round(forecast.bestTimeToVisit.confidenceScore)}% fit
                        </span>
                      </div>

                      {forecast.alert ? (
                        <div className="mt-4 flex gap-3 rounded-[16px] border border-[#F59E0B]/20 bg-[#F59E0B]/10 p-4 text-sm leading-7 text-[#F8D7A1]">
                          <TriangleAlert className="mt-1 size-4 shrink-0 text-[#F59E0B]" />
                          <span>{forecast.alert}</span>
                        </div>
                      ) : null}

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {forecast.forecast.map((day) => (
                          <div
                            key={`${forecast.destinationId}-${day.date}`}
                            className="rounded-[14px] border border-white/8 bg-white/[0.03] p-3"
                          >
                            <p className="text-xs uppercase tracking-[0.18em] text-[#4A5568]">
                              {new Date(`${day.date}T00:00:00.000Z`).toLocaleDateString()}
                            </p>
                            <p className="mt-2 text-sm font-medium text-white">
                              {day.summary}
                            </p>
                            <p className="mt-1 text-sm text-[#8B9BB4]">
                              {day.temperatureMin}C - {day.temperatureMax}C
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[18px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-[#8B9BB4]">
                  Weather data is not available yet for this trip. Forecasts appear once we have
                  destination coordinates and a valid travel window.
                </div>
              )}
            </div>

            {activeItinerary ? (
              <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-6">
                <p className="section-label">AI Weather Outlook</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                  Day-by-day badges from your active AI itinerary
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {activeItinerary.days.map((day) => (
                    <div
                      key={day.day}
                      className="rounded-[18px] border border-white/8 bg-[#0F1117] p-5"
                    >
                      <p className="text-xs uppercase tracking-[0.22em] text-[#4A5568]">
                        Day {day.day}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{day.title}</h3>
                      {day.weather ? (
                        <p className="mt-3 text-sm leading-7 text-[#D8E2F1]">
                          {day.weather.summary} · {day.weather.temperatureMin}C to{" "}
                          {day.weather.temperatureMax}C
                        </p>
                      ) : (
                        <p className="mt-3 text-sm leading-7 text-[#8B9BB4]">
                          Weather badge will appear once the itinerary has weather context.
                        </p>
                      )}
                      {day.destinationSeason ? (
                        <div className="mt-4 inline-flex rounded-full border border-[#00C2FF]/20 bg-[#00C2FF]/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#D8E2F1]">
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
          </TabsContent>

          <TabsContent value="itinerary">
            <div className="space-y-6">
              {trip.locations.length > 0 ? (
                <SortableItinerary locations={trip.locations} tripId={trip.id} />
              ) : (
                <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-[#8B9BB4]">
                  Add locations to build your itinerary.
                </div>
              )}

              <DestinationNotesPanel locations={trip.locations} />
            </div>
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
