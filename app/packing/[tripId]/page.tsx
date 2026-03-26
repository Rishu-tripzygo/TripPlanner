import { auth } from "@/auth";
import PackingListManager from "@/components/packing-list-manager";
import { prisma } from "@/lib/prisma";
import { PackingListRecord } from "@/lib/phase-one-types";
import { generatePackingItems } from "@/lib/packing-list";
import { getTripAccess } from "@/lib/trip-access";

export default async function PackingPage({
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
      packingList: true,
      locations: {
        orderBy: { order: "asc" },
      },
      itineraryVersions: {
        where: { isActive: true },
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

  const initialList: PackingListRecord = trip.packingList
    ? {
        id: trip.packingList.id,
        tripId: trip.packingList.tripId,
        template: trip.packingList.template,
        items: trip.packingList.items as unknown as PackingListRecord["items"],
      }
    : {
        id: "generated",
        tripId: trip.id,
        template: "Smart AI pack",
        items: generatePackingItems({
          tripTitle: trip.title,
          startDate: trip.startDate.toISOString(),
          endDate: trip.endDate.toISOString(),
          destinationNames: trip.locations.map((location) => location.locationTitle),
          itinerary:
            (trip.itineraryVersions[0]?.itineraryData as never) || null,
        }),
      };

  return (
    <PackingListManager
      tripId={trip.id}
      tripTitle={trip.title}
      initialList={initialList}
    />
  );
}
