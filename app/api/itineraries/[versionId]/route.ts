import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeVersionRecord } from "@/lib/itinerary-utils";
import { buildRouteStateForActiveVersion } from "@/lib/trip-route-state";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { versionId } = await params;
  const body = await request.json();
  const { itineraryData, setActive } = body;

  const version = await prisma.itineraryVersion.findFirst({
    where: {
      id: versionId,
      trip: {
        userId: session.user.id,
      },
    },
    include: {
      trip: {
        select: {
          id: true,
          routeSourceVersionId: true,
          _count: {
            select: {
              locations: true,
            },
          },
        },
      },
    },
  });

  if (!version) {
    return NextResponse.json({ error: "Itinerary version not found." }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (setActive) {
      await tx.itineraryVersion.updateMany({
        where: { tripId: version.tripId, isActive: true },
        data: { isActive: false },
      });
    }

    const updatedVersion = await tx.itineraryVersion.update({
      where: { id: version.id },
      data: {
        itineraryData: itineraryData ?? version.itineraryData,
        isActive: setActive ? true : version.isActive,
      },
    });

    let updatedTrip: {
      id: string;
      routeStatus: string;
      _count: {
        locations: number;
      };
    } | null = null;

    if (setActive) {
      updatedTrip = await tx.trip.update({
        where: { id: version.tripId },
        data: buildRouteStateForActiveVersion({
          itinerary: updatedVersion.itineraryData as never,
          activeVersionId: updatedVersion.id,
          confirmedLocationCount: version.trip._count.locations,
          currentRouteSourceVersionId: version.trip.routeSourceVersionId || null,
        }),
        select: {
          id: true,
          routeStatus: true,
          _count: {
            select: {
              locations: true,
            },
          },
        },
      });
    }

    return { updatedVersion, updatedTrip };
  });

  return NextResponse.json({
    version: serializeVersionRecord(updated.updatedVersion),
    trip: updated.updatedTrip
      ? {
          id: updated.updatedTrip.id,
          routeStatus: updated.updatedTrip.routeStatus,
          confirmedStopsCount: updated.updatedTrip._count.locations,
        }
      : null,
  });
}
