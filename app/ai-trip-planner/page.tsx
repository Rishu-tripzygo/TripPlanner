import { auth } from "@/auth";
import AITripPlanner from "@/components/ai-trip-planner";
import AuthButton from "@/components/auth-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoTripPreview } from "@/lib/demo-content";
import { prisma } from "@/lib/prisma";
import { ArrowRight, CalendarDays, MapPinned, Sparkles, Users } from "lucide-react";
import Link from "next/link";

interface AITripPlannerPageProps {
  searchParams: Promise<{
    tripId?: string | string[];
    destination?: string | string[];
    style?: string | string[];
    days?: string | string[];
    travelers?: string | string[];
  }>;
}

export default async function AITripPlannerPage({
  searchParams,
}: AITripPlannerPageProps) {
  const session = await auth();
  const params = await searchParams;
  const requestedTripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;
  const requestedDestination = Array.isArray(params.destination)
    ? params.destination[0]
    : params.destination;
  const requestedStyle = Array.isArray(params.style) ? params.style[0] : params.style;
  const requestedDays = Array.isArray(params.days) ? params.days[0] : params.days;
  const requestedTravelers = Array.isArray(params.travelers)
    ? params.travelers[0]
    : params.travelers;
  const initialDraft = {
    destination: requestedDestination || undefined,
    travelStyle: requestedStyle || undefined,
    days:
      requestedDays && !Number.isNaN(Number(requestedDays)) ? Number(requestedDays) : undefined,
    travelers:
      requestedTravelers && !Number.isNaN(Number(requestedTravelers))
        ? Number(requestedTravelers)
        : undefined,
  };

  if (!session?.user?.id) {
    return (
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="app-shell overflow-hidden rounded-[36px] border border-[rgba(2,71,133,0.08)] bg-[linear-gradient(180deg,#ffffff,#f6f4ef)] shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
          <div className="grid gap-8 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-12">
            <div>
              <p className="section-label">Plan with AI</p>
              <h1 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[48px] font-bold leading-[0.92] tracking-[-0.05em] text-[#024785] sm:text-[64px]">
                Start with the trip brief. See the itinerary take shape.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#61738C]">
                You do not need to know every stop up front. Wandrly turns a destination, dates,
                and travel style into a structured itinerary, then keeps the trip ready for route,
                budget, and prep.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Destination", value: demoTripPreview.destination, Icon: MapPinned },
                  { label: "Dates", value: "12 Apr - 17 Apr", Icon: CalendarDays },
                  { label: "Travelers", value: demoTripPreview.travelers, Icon: Users },
                  { label: "Style", value: demoTripPreview.style, Icon: Sparkles },
                ].map(({ label, value, Icon }) => (
                  <div
                    key={label}
                    className="rounded-[24px] border border-white/55 bg-white/60 px-5 py-5 shadow-[0_10px_24px_rgba(20,81,139,0.05)] backdrop-blur-xl"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7A8EA8]">
                      {label}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-[#1f3550]">
                      <Icon className="size-4 text-[#14518b]" />
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <AuthButton
                  isLoggedIn={false}
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#024785,#2B5F9E)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(2,71,133,0.16)]"
                >
                  Generate My Trip
                </AuthButton>
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center rounded-full border border-white/55 bg-white/68 px-6 py-3 text-sm font-semibold text-[#14518b] backdrop-blur-xl"
                >
                  Explore Sample Trips
                </Link>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[30px] border border-white/55 bg-white/58 p-6 shadow-[0_18px_38px_rgba(26,28,27,0.06)] backdrop-blur-[24px]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="section-label text-[#14518b]">Preview itinerary</p>
                    <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[2.2rem] font-bold tracking-[-0.04em] text-[#0f3460]">
                      {demoTripPreview.title}
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[#61738C]">
                      {demoTripPreview.description}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/55 bg-white/72 px-4 py-2 text-sm font-medium text-[#14518b]">
                    {demoTripPreview.duration}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {demoTripPreview.days.map((day) => (
                    <div
                      key={day.label}
                      className="rounded-[24px] border border-white/55 bg-[#FAF9F7]/86 p-5 shadow-[0_12px_24px_rgba(20,81,139,0.04)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#14518b]">
                          {day.label}
                        </p>
                        <span className="rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#7A8EA8]">
                          AI draft
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-[#0f3460]">{day.title}</h3>
                      <div className="mt-4 space-y-3 text-sm leading-7 text-[#566b84]">
                        <div>
                          <p className="font-medium text-[#0f3460]">Morning</p>
                          <p>{day.morning[0]}</p>
                        </div>
                        <div>
                          <p className="font-medium text-[#0f3460]">Afternoon</p>
                          <p>{day.afternoon[0]}</p>
                        </div>
                        <div>
                          <p className="font-medium text-[#0f3460]">Evening</p>
                          <p>{day.evening[0]}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="border-white/55 bg-white/62 backdrop-blur-[22px]">
                <CardHeader>
                  <p className="section-label text-[#14518b]">What sign-in unlocks</p>
                  <CardTitle className="font-[family-name:var(--font-noto-serif)] text-[2rem] text-[#024785]">
                    Save, refine, and move into your workspace
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#61738C]">
                  {[
                    "Save the generated itinerary to a real trip automatically.",
                    "Refine versions with AI without losing earlier drafts.",
                    "Confirm route suggestions on the map and start prep modules.",
                  ].map((item) => (
                    <div key={item} className="rounded-[18px] bg-[#F4F3F1] px-4 py-4 text-sm leading-7">
                      {item}
                    </div>
                  ))}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <AuthButton
                      isLoggedIn={false}
                      className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#024785,#2B5F9E)] px-5 py-3 text-sm font-semibold text-white"
                    >
                      Continue with GitHub
                    </AuthButton>
                    <Link
                      href="/explore"
                      className="inline-flex items-center justify-center rounded-full border border-[rgba(2,71,133,0.12)] bg-white px-5 py-3 text-sm font-semibold text-[#14518b]"
                    >
                      See Demo Trip
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      locations: {
        select: {
          locationTitle: true,
        },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="app-shell overflow-hidden rounded-[36px] border border-[rgba(2,71,133,0.08)] bg-[linear-gradient(180deg,#ffffff,#f6f4ef)] shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
        <div className="grid gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-12">
          <div>
            <p className="section-label">Plan with AI</p>
            <h1 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[52px] font-bold leading-[0.92] tracking-[-0.05em] text-[#024785] sm:text-[68px]">
              Turn a trip brief into a working itinerary.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#61738C]">
              Start from a blank travel idea or attach the planner to an existing trip. Wandrly
              can now generate the itinerary, create the trip automatically, save the active
              version, and move you straight into the workspace.
            </p>
          </div>

          <div className="rounded-[30px] bg-[#F4F3F1] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#024785]">
              Best workflow
            </p>
            <div className="mt-5 space-y-4">
              {[
                "1. Fill the brief and let AI shape the first route.",
                "2. Auto-create the trip or attach the plan to an existing one.",
                "3. Save the generated itinerary as the active version.",
                "4. Open Trips to manage route stops, prep, and refinements.",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-white px-4 py-4 text-sm text-[#3E536F] shadow-[0_10px_18px_rgba(26,28,27,0.04)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AITripPlanner
        initialTripId={requestedTripId}
        initialDraft={initialDraft}
        trips={trips.map((trip) => ({
          id: trip.id,
          title: trip.title,
          startDate: trip.startDate.toISOString(),
          endDate: trip.endDate.toISOString(),
          destinationHint: trip.locations[0]?.locationTitle || null,
        }))}
      />
    </div>
  );
}
