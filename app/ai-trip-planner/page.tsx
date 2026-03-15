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
  );
}
