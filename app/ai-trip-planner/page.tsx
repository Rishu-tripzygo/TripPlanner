import { auth } from "@/auth";
import AITripPlanner from "@/components/ai-trip-planner";
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

  const trips = session?.user?.id
    ? await prisma.trip.findMany({
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
      })
    : [];

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
              Start by attaching the planner to a real trip. That keeps the experience clean:
              generate the draft, save versions, refine with AI, then move into the trip
              workspace for route stops, budget, documents, and prep.
            </p>
          </div>

          <div className="rounded-[30px] bg-[#F4F3F1] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#024785]">
              Best workflow
            </p>
            <div className="mt-5 space-y-4">
              {[
                "1. Select or create a trip shell.",
                "2. Generate the first AI itinerary draft.",
                "3. Save it as the active version.",
                "4. Refine details, then move into route and prep modules.",
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
