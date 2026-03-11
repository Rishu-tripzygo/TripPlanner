import React from "react";
import {
  Compass,
  Map,
  Plane,
  Sparkles,
  Stars,
  Telescope,
} from "lucide-react";
import { auth } from "@/auth";
import AuthButton from "@/components/auth-button";
import Link from "next/link";

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_26%),linear-gradient(180deg,_#f6fbff_0%,_#ffffff_35%,_#f8fafc_100%)]">
      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-sky-900 shadow-sm backdrop-blur">
                <Sparkles className="size-4" />
                AI planner, itineraries, maps, and travel memory tools
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  Design trips that feel
                  <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                    {" "}
                    cinematic
                  </span>
                  , not chaotic.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                  Build polished journeys with AI trip planning, drag-and-drop
                  itineraries, visual maps, and travel dashboards that keep the
                  whole plan sharp from first idea to final boarding pass.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <AuthButton
                  isLoggedIn={isLoggedIn}
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-base font-medium text-white shadow-xl shadow-sky-200 transition hover:bg-slate-800"
                >
                  {isLoggedIn ? (
                    "Open Dashboard"
                  ) : (
                    <>
                      <Plane className="mr-2 size-5" />
                      Start Planning
                    </>
                  )}
                </AuthButton>
                <Link
                  href="/ai-trip-planner"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-7 py-4 text-base font-medium text-slate-800 shadow-sm backdrop-blur transition hover:border-sky-300 hover:bg-sky-50"
                >
                  Try AI Trip Planner
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["48h", "to build a complete polished itinerary"],
                  ["3 views", "dashboard, maps, and AI planner aligned"],
                  ["1 flow", "from idea to itinerary without tool switching"],
                ].map(([value, label]) => (
                  <div
                    key={value}
                    className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-lg shadow-sky-100/60 backdrop-blur"
                  >
                    <p className="text-3xl font-semibold text-slate-950">{value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-sky-300/30 via-transparent to-emerald-300/20 blur-3xl" />
              <div className="rounded-[2rem] border border-white/80 bg-slate-950 p-6 text-white shadow-2xl shadow-sky-200/60">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-white/10 p-5 backdrop-blur">
                    <div className="mb-4 inline-flex rounded-2xl bg-sky-400/20 p-3 text-sky-100">
                      <Compass className="size-5" />
                    </div>
                    <p className="text-sm uppercase tracking-[0.25em] text-sky-100/70">
                      Smart Planning
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold">
                      Multi-day itineraries with built-in pacing
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-200">
                      AI-generated days, hotel picks, food highlights, local
                      transport tips, and fallback activity ideas in one place.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] bg-white p-5 text-slate-900">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            Sample Route
                          </p>
                          <h3 className="mt-2 text-xl font-semibold">
                            Lisbon Coastal Escape
                          </h3>
                        </div>
                        <Stars className="size-5 text-amber-500" />
                      </div>
                      <div className="mt-4 space-y-3">
                        {[
                          "Day 1 · Alfama + sunset tram loop",
                          "Day 2 · Belem culture + riverside dining",
                          "Day 3 · Sintra palaces + hidden garden stops",
                        ].map((line) => (
                          <div
                            key={line}
                            className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.5rem] bg-emerald-300/15 p-5">
                        <p className="text-sm text-emerald-100/80">Hotels</p>
                        <p className="mt-2 text-lg font-semibold">
                          Boutique stays near the center
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] bg-sky-300/15 p-5">
                        <p className="text-sm text-sky-100/80">Travel Mode</p>
                        <p className="mt-2 text-lg font-semibold">
                          Walkable, scenic, food-first
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
                Why It Feels Premium
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
                Built for travelers who want structure without losing discovery.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-[2rem] border border-white/80 bg-white/75 p-7 shadow-xl shadow-sky-100/70 backdrop-blur">
                <div className="mb-5 inline-flex rounded-2xl bg-sky-100 p-3 text-sky-800">
                  <Map className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Living route visualization
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Plot each stop, understand geography fast, and shape the trip
                  around what is actually convenient on the ground.
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/80 bg-white/75 p-7 shadow-xl shadow-sky-100/70 backdrop-blur">
                <div className="mb-5 inline-flex rounded-2xl bg-amber-100 p-3 text-amber-800">
                  <Telescope className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Better day-by-day decisions
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Organize each day by energy, timing, food, scenery, and travel
                  distance instead of storing random lists of places.
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/80 bg-white/75 p-7 shadow-xl shadow-sky-100/70 backdrop-blur">
                <div className="mb-5 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                  <Plane className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Flexible enough for real travel
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Reorder stops, add location notes, and let the itinerary evolve
                  when weather, energy, or logistics change mid-trip.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-sky-200/40 sm:px-10 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-200">
                  Ready To Build
                </p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                  Turn your next idea into a trip plan worth booking.
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                  Use the AI planner for instant direction, then refine the trip
                  with maps, draggable itinerary cards, and destination-by-destination edits.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
                <AuthButton
                  isLoggedIn={isLoggedIn}
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-base font-medium text-slate-950 transition hover:bg-sky-50"
                >
                  {isLoggedIn ? "Go To My Trips" : "Sign In To Start"}
                </AuthButton>
                <Link
                  href="/ai-trip-planner"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-base font-medium text-white transition hover:bg-white/10"
                >
                  Explore AI Planner
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
