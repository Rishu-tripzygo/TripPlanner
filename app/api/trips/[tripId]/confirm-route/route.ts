import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  extractSuggestedStopsFromItinerary,
  geocodeAddress,
} from "@/lib/route-suggestions";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await params;

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
    include: {
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
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const activeItinerary = trip.itineraryVersions[0]?.itineraryData as unknown as
    | import("@/lib/phase-one-types").PersistedItinerary
    | undefined;

  const suggestions = extractSuggestedStopsFromItinerary(activeItinerary);

  if (suggestions.length === 0) {
    return NextResponse.json(
      { error: "No AI route suggestions are available for this trip yet." },
      { status: 400 }
    );
  }

  if (trip.locations.length > 0) {
    return NextResponse.json(
      { error: "This trip already has confirmed route stops." },
      { status: 409 }
    );
  }

  try {
    const geocoded = await Promise.all(
      suggestions.map(async (place, index) => {
        const { lat, lng } = await geocodeAddress(place);
        return {
          locationTitle: place,
          lat,
          lng,
          tripId,
          order: index,
        };
      })
    );

    await prisma.location.createMany({
      data: geocoded,
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "ROUTE_CONFIRMED",
        tripId,
        message: `AI route suggestions were confirmed for ${trip.title}.`,
      },
    });

    return NextResponse.json({
      ok: true,
      createdStops: geocoded.length,
      suggestions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to confirm AI route suggestions.",
      },
      { status: 500 }
    );
  }
}
