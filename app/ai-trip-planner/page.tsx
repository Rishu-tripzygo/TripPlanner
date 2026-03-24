import { auth } from "@/auth";
import AITripPlanner from "@/components/ai-trip-planner";
import AuthButton from "@/components/auth-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

interface AITripPlannerPageProps {
  searchParams: Promise<{
    tripId?: string | string[];
  }>;
}

export default async function AITripPlannerPage({
  searchParams,
}: AITripPlannerPageProps) {
  const session = await auth();
  const params = await searchParams;
  const requestedTripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;

  if (!session?.user?.id) {
    return (
      <div className="app-shell px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-3xl text-center">
          <CardHeader>
            <p className="section-label">Plan with AI</p>
            <CardTitle className="font-[family-name:var(--font-noto-serif)] text-4xl text-[#024785]">
              Sign in to generate and save itineraries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-[#61738C]">
            <p className="mx-auto max-w-2xl text-sm leading-8">
              The planner saves versions to real trips so you can refine them, move into the
              workspace, and keep budgets, maps, docs, and journals connected.
            </p>
            <AuthButton
              isLoggedIn={false}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#024785,#2B5F9E)] px-6 py-3 text-sm font-semibold text-white"
            >
              Sign in with GitHub
            </AuthButton>
          </CardContent>
        </Card>
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
