"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe2, MapPin, Orbit, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";

export interface TransformedLocation {
  lat: number;
  lng: number;
  name: string;
  country: string;
}

export default function GlobePage() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  const [visitedCountries, setVisitedCountries] = useState<Set<string>>(
    new Set()
  );
  const [locations, setLocations] = useState<TransformedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/trips");
        const data = await response.json();
        setLocations(data);
        const countries = new Set<string>(
          data.map((loc: TransformedLocation) => loc.country)
        );

        setVisitedCountries(countries);
      } catch (err) {
        console.error("error", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_22%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_40%,_#f8fafc_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-sky-900 shadow-sm backdrop-blur">
            <Orbit className="size-4" />
            Global footprint
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Your travel journey, mapped in motion
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            See how your trips spread across countries, spot travel clusters, and
            turn location history into a visual story.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-sky-100/70">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-2xl font-semibold text-slate-950">
                Orbit your destinations
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Spin the globe, inspect country coverage, and view the places generated from your saved itinerary data.
              </p>
            </div>

            <div className="relative h-[620px] w-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#eef8ff_100%)] p-4">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-4 text-slate-600">
                    <div className="rounded-full bg-white p-4 shadow-lg shadow-sky-100/60">
                      <Sparkles className="size-8 animate-pulse text-sky-700" />
                    </div>
                    <p className="text-sm font-medium">Loading your travel footprint...</p>
                  </div>
                </div>
              ) : (
                <Globe
                  ref={globeRef}
                  globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                  bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                  backgroundColor="rgba(0,0,0,0)"
                  pointColor={() => "#0f766e"}
                  pointLabel="name"
                  pointsData={locations}
                  pointRadius={0.5}
                  pointAltitude={0.12}
                  pointsMerge={true}
                  width={800}
                  height={600}
                />
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <Card className="rounded-[2rem] border-white/80 bg-slate-950 text-white shadow-2xl shadow-sky-100/60">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3">
                  <Globe2 className="size-5 text-sky-200" />
                </div>
                <p className="text-sm uppercase tracking-[0.25em] text-sky-200">
                  Travel Coverage
                </p>
                <p className="mt-3 text-4xl font-semibold">{visitedCountries.size}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Countries represented from the locations saved in your trips.
                </p>
              </CardContent>
            </Card>

            <Card className="sticky top-24 rounded-[2rem] border-white/80 bg-white/80 shadow-xl shadow-sky-100/60">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-950">
                  Countries Visited
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-slate-900" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] bg-sky-50 p-4">
                      <p className="text-sm text-sky-800">
                        You have mapped{" "}
                        <span className="font-bold">{visitedCountries.size}</span> countries.
                      </p>
                    </div>

                    <div className="max-h-[500px] space-y-2 overflow-y-auto pr-2">
                      {Array.from(visitedCountries)
                        .sort()
                        .map((country, key) => (
                          <div
                            key={key}
                            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition hover:border-sky-200 hover:bg-sky-50"
                          >
                            <MapPin className="h-4 w-4 text-sky-700" />
                            <span className="font-medium text-slate-800">{country}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
