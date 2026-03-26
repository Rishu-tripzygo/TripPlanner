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
    return (
      <div className="landing-shell px-4 py-20 sm:px-5 lg:px-6">
        <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] px-6 py-10 text-[#61738C] shadow-[0_20px_44px_rgba(26,28,27,0.07)]">
          Please sign in.
        </div>
      </div>
    );
  }

  const access = await getTripAccess(tripId, session.user.id);

  if (!access) {
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
    include: {
      journalEntries: {
        orderBy: { day: "asc" },
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
