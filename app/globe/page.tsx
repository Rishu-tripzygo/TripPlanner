"use client";

import SkeletonCard from "@/components/ui/skeleton-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe2, MapPin, Orbit } from "lucide-react";
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
  const [visitedCountries, setVisitedCountries] = useState<Set<string>>(new Set());
  const [locations, setLocations] = useState<TransformedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/trips");
        const data = await response.json();
        setLocations(data);
        setVisitedCountries(
          new Set<string>(data.map((loc: TransformedLocation) => loc.country))
        );
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
      globeRef.current.controls().autoRotateSpeed = 0.45;
    }
  }, []);

  return (
    <div className="app-shell space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="text-center">
        <p className="section-label">Travel History</p>
        <h1 className="mt-4 text-[42px] font-semibold tracking-[-0.05em] text-white sm:text-[58px]">
          Your travel journey, mapped on a living globe
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#8B9BB4]">
          See your destinations as a global footprint, spot country clusters, and
          browse places you have already turned into memories.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[32px] border border-white/8 bg-[#0F1117] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_40px_rgba(0,0,0,0.6)]">
          <div className="border-b border-white/8 p-6">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
              Orbit your destinations
            </h2>
            <p className="mt-2 text-sm leading-7 text-[#8B9BB4]">
              Hover over your travel footprint and browse the destinations your planner has already captured.
            </p>
          </div>
          <div className="relative h-[620px] bg-[radial-gradient(circle_at_top,rgba(0,194,255,0.12),transparent_28%),linear-gradient(180deg,#0F1117_0%,#08090E_100%)] p-4">
            {isLoading ? (
              <div className="h-full">
                <SkeletonCard className="h-full" />
              </div>
            ) : (
              <Globe
                ref={globeRef}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundColor="rgba(0,0,0,0)"
                pointColor={() => "#00C2FF"}
                pointLabel="name"
                pointsData={locations}
                pointRadius={0.55}
                pointAltitude={0.13}
                pointsMerge={true}
                width={800}
                height={600}
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(0,194,255,0.16),transparent_30%),linear-gradient(145deg,#161820,#0F1117)]">
            <CardContent className="pt-6">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                <Globe2 className="size-5" />
              </div>
              <p className="section-label">Coverage</p>
              <p className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-white">
                {visitedCountries.size}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#8B9BB4]">
                Countries represented from the destinations stored across your trips.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-white">Visited countries</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <SkeletonCard className="h-24" />
                  <SkeletonCard className="h-24" />
                </div>
              ) : (
                <div className="max-h-[420px] space-y-2 overflow-y-auto pr-2">
                  {Array.from(visitedCountries)
                    .sort()
                    .map((country) => (
                      <div
                        key={country}
                        className="flex items-center gap-3 rounded-[16px] border border-white/8 bg-white/[0.03] p-3"
                      >
                        <MapPin className="size-4 text-[#00C2FF]" />
                        <span className="text-sm font-medium text-white">{country}</span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-white">Destination strip</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {locations.map((location) => (
                  <div
                    key={`${location.name}-${location.lat}`}
                    className="min-w-[220px] rounded-[20px] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#8B9BB4]">
                      <Orbit className="mr-2 size-3.5 text-[#00C2FF]" />
                      Saved stop
                    </div>
                    <p className="text-sm font-medium leading-6 text-white">{location.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#4A5568]">
                      {location.country}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
