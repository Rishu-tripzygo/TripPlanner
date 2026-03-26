import { auth } from "@/auth";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { canManageTrip, getTripAccess } from "@/lib/trip-access";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tripId } = await params;
  const access = await getTripAccess(tripId, session.user.id);

  if (!canManageTrip(access)) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
    },
    include: {
      locations: {
        orderBy: { order: "asc" },
      },
      budget: true,
      packingList: true,
      itineraryVersions: {
        where: { isActive: true },
        take: 1,
        orderBy: { versionNumber: "desc" },
      },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const duplicate = await prisma.$transaction(async (tx) => {
    const copiedTrip = await tx.trip.create({
      data: {
        userId: session.user.id,
        title: `Copy of ${trip.title}`,
        description: trip.description,
        imageUrl: trip.imageUrl,
        startDate: trip.startDate,
        endDate: trip.endDate,
        routeStatus: trip.locations.length > 0 ? trip.routeStatus : "NOT_STARTED",
        originLabel: trip.originLabel,
        originLat: trip.originLat,
        originLng: trip.originLng,
        returnToOrigin: trip.returnToOrigin,
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
      },
    });

    let copiedVersionId: string | null = null;

    if (trip.itineraryVersions[0]) {
      const version = await tx.itineraryVersion.create({
        data: {
          tripId: copiedTrip.id,
          versionNumber: 1,
          sourceProvider: trip.itineraryVersions[0].sourceProvider,
          sourcePrompt: trip.itineraryVersions[0].sourcePrompt,
          title: trip.itineraryVersions[0].title,
          itineraryData: trip.itineraryVersions[0]
            .itineraryData as unknown as Prisma.InputJsonValue,
          isActive: true,
        },
        select: { id: true },
      });
      copiedVersionId = version.id;
    }

    if (trip.locations.length > 0) {
      await tx.location.createMany({
        data: trip.locations.map((location) => ({
          tripId: copiedTrip.id,
          locationTitle: location.locationTitle,
          lat: location.lat,
          lng: location.lng,
          order: location.order,
        })),
      });
    }

    if (trip.budget) {
      await tx.budget.create({
        data: {
          tripId: copiedTrip.id,
          totalBudget: trip.budget.totalBudget,
          currency: trip.budget.currency,
          accommodation: trip.budget.accommodation,
          food: trip.budget.food,
          transport: trip.budget.transport,
          activities: trip.budget.activities,
          misc: trip.budget.misc,
        },
      });
    }

    if (trip.packingList) {
      await tx.packingList.create({
        data: {
          tripId: copiedTrip.id,
          template: trip.packingList.template,
          items: trip.packingList.items as unknown as Prisma.InputJsonValue,
        },
      });
    }

    const finalizedTrip = await tx.trip.update({
      where: { id: copiedTrip.id },
      data: {
        routeSourceVersionId: copiedVersionId,
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
      },
    });

    return finalizedTrip;
  });

  return NextResponse.json({
    id: duplicate.id,
    title: duplicate.title,
    startDate: duplicate.startDate.toISOString(),
    endDate: duplicate.endDate.toISOString(),
  });
}
