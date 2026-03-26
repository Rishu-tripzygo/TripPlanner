import { auth } from "@/auth";
import JournalManager from "@/components/journal-manager";
import { prisma } from "@/lib/prisma";
import { getTripAccess } from "@/lib/trip-access";
import { JournalEntryRecord } from "@/lib/phase-one-types";

export default async function JournalPage({
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

  if (!access) {
    return <div className="app-shell px-4 py-20 text-white">Trip not found.</div>;
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
    },
    include: {
      journalEntries: {
        orderBy: { day: "asc" },
      },
    },
  });

  if (!trip) {
    return <div className="app-shell px-4 py-20 text-white">Trip not found.</div>;
  }

  const tripDays = Math.max(
    1,
    Math.ceil(
      (trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1
  );

  const initialEntries: JournalEntryRecord[] = trip.journalEntries.map((entry) => ({
    id: entry.id,
    tripId: entry.tripId,
    day: entry.day,
    content: entry.content,
    photos: (entry.photos as string[]) || [],
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));

  return (
    <JournalManager
      tripId={trip.id}
      tripTitle={trip.title}
      tripDays={tripDays}
      initialEntries={initialEntries}
    />
  );
}
