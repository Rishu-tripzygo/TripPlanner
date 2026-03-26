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
    return (
      <div className="landing-shell px-4 py-20 sm:px-5 lg:px-6">
        <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] px-6 py-10 text-[#61738C] shadow-[0_20px_44px_rgba(26,28,27,0.07)]">
          Please sign in.
        </div>
      </div>
    );
  }

  const access = await getTripAccess(tripId, session.user.id);

  if (!canManageTrip(access)) {
    return (
      <div className="landing-shell px-4 py-20 sm:px-5 lg:px-6">
        <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] px-6 py-10 text-[#61738C] shadow-[0_20px_44px_rgba(26,28,27,0.07)]">
          Trip not found.
        </div>
      </div>
    );
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
    return (
      <div className="landing-shell px-4 py-20 sm:px-5 lg:px-6">
        <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] px-6 py-10 text-[#61738C] shadow-[0_20px_44px_rgba(26,28,27,0.07)]">
          Trip not found.
        </div>
      </div>
    );
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
