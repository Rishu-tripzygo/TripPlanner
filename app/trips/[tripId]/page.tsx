import { auth } from "@/auth";
import TripDetailClient from "@/components/trip-detail";
import { prisma } from "@/lib/prisma";
import { getTripAccess } from "@/lib/trip-access";

export default async function TripDetail({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  const session = await auth();

  if (!session) {
    return <div> Please sign in.</div>;
  }

  const access = await getTripAccess(tripId, session.user.id);

  if (!access) {
    return <div> Trip not found.</div>;
  }

  const trip = await prisma.trip.findFirst({
    where: { id: tripId },
    include: {
      locations: true,
      itineraryVersions: {
        where: { isActive: true },
        take: 1,
      },
    },
  });
  if (!trip) {
    return <div> Trip not found.</div>;
  }

  return (
    <TripDetailClient
      trip={trip}
      canManageTrip={access.isOwner}
      activeItinerary={
        (trip.itineraryVersions[0]?.itineraryData as never) || null
      }
    />
  );
}
