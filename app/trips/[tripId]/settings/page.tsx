import { auth } from "@/auth";
import TripSettingsPanel from "@/components/trip-settings-panel";
import { prisma } from "@/lib/prisma";
import { canManageTrip, getTripAccess } from "@/lib/trip-access";

export default async function TripSettingsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const session = await auth();
  const { tripId } = await params;

  if (!session?.user?.id) {
    return <div className="app-shell px-4 py-20 text-white">Please sign in.</div>;
  }

  const access = await getTripAccess(tripId, session.user.id);

  if (!canManageTrip(access)) {
    return <div className="app-shell px-4 py-20 text-white">Trip not found.</div>;
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      startDate: true,
      endDate: true,
      _count: {
        select: {
          locations: true,
        },
      },
      itineraryVersions: {
        where: { isActive: true },
        select: {
          itineraryData: true,
        },
        take: 1,
      },
    },
  });

  if (!trip) {
    return <div className="app-shell px-4 py-20 text-white">Trip not found.</div>;
  }

  const activeItinerary = trip.itineraryVersions[0]?.itineraryData as
    | { days?: unknown[] }
    | undefined;

  return (
    <TripSettingsPanel
      trip={{
        id: trip.id,
        title: trip.title,
        description: trip.description,
        imageUrl: trip.imageUrl,
        startDate: trip.startDate.toISOString(),
        endDate: trip.endDate.toISOString(),
        confirmedStopsCount: trip._count.locations,
        activeItineraryDays: activeItinerary?.days?.length || 0,
      }}
    />
  );
}
