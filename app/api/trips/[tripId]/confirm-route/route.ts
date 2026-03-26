import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  extractSuggestedStopsFromItinerary,
  geocodeAddress,
} from "@/lib/route-suggestions";
import { buildRouteStateAfterConfirmation } from "@/lib/trip-route-state";
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
  const body = await request.json().catch(() => ({}));
  const replaceExisting = Boolean(body.replaceExisting);
  const selectedStops = Array.isArray(body.selectedStops)
    ? body.selectedStops
        .filter((value: unknown): value is string => typeof value === "string")
        .map((value: string) => value.trim())
        .filter(Boolean)
    : null;
  const originLabel =
    typeof body.originLabel === "string" ? body.originLabel.trim() : undefined;
  const returnToOrigin =
    typeof body.returnToOrigin === "boolean" ? body.returnToOrigin : undefined;

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
  const routeStops = selectedStops && selectedStops.length > 0 ? selectedStops : suggestions;

  if (suggestions.length === 0) {
    return NextResponse.json(
      { error: "No AI route suggestions are available for this trip yet." },
      { status: 400 }
    );
  }

  if (routeStops.length === 0) {
    return NextResponse.json(
      { error: "Choose at least one route stop before confirming the route." },
      { status: 400 }
    );
  }

  if (trip.locations.length > 0) {
    if (!replaceExisting) {
      return NextResponse.json(
        { error: "This trip already has confirmed route stops." },
        { status: 409 }
      );
    }
  }

  try {
    const destinationContext =
      activeItinerary?.trip_summary.destination || trip.title || null;
    const nextOriginLabel =
      originLabel !== undefined ? originLabel || null : trip.originLabel || null;
    let nextOriginCoords:
      | {
          lat: number;
          lng: number;
        }
      | null = null;

    if (nextOriginLabel) {
      const { lat, lng } = await geocodeAddress(nextOriginLabel, destinationContext);
      nextOriginCoords = { lat, lng };
    }

    const geocoded: Array<{
      locationTitle: string;
      lat: number;
      lng: number;
      tripId: string;
      order: number;
    }> = [];
    const skippedStops: Array<{ stop: string; reason: string }> = [];

    for (const place of routeStops) {
      try {
        const { lat, lng } = await geocodeAddress(place, destinationContext);
        geocoded.push({
          locationTitle: place,
          lat,
          lng,
          tripId,
          order: geocoded.length,
        });
      } catch (error) {
        skippedStops.push({
          stop: place,
          reason:
            error instanceof Error ? error.message : "Failed to geocode route stop.",
        });
      }
    }

    if (geocoded.length === 0) {
      return NextResponse.json(
        {
          error:
            skippedStops[0]?.reason ||
            "No AI route suggestions could be mapped for this trip yet.",
        },
        { status: 422 }
      );
    }

    await prisma.$transaction(async (tx) => {
      if (replaceExisting && trip.locations.length > 0) {
        await tx.location.deleteMany({
          where: { tripId },
        });
      }

      await tx.location.createMany({
        data: geocoded,
      });

      await tx.trip.update({
        where: { id: tripId },
        data: {
          ...buildRouteStateAfterConfirmation(trip.itineraryVersions[0]?.id || null),
          ...(originLabel !== undefined
            ? {
                originLabel: nextOriginLabel,
                originLat: nextOriginCoords?.lat ?? null,
                originLng: nextOriginCoords?.lng ?? null,
              }
            : {}),
          ...(returnToOrigin !== undefined ? { returnToOrigin } : {}),
        },
      });

      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: replaceExisting ? "ROUTE_UPDATED" : "ROUTE_CONFIRMED",
          tripId,
          message: replaceExisting
            ? `The confirmed route was refreshed from the latest AI itinerary for ${trip.title}.`
            : `AI route suggestions were confirmed for ${trip.title}.`,
        },
      });
    });

    return NextResponse.json({
      ok: true,
      createdStops: geocoded.length,
      suggestions: routeStops,
      replacedExisting: replaceExisting,
      skippedStops,
      originLabel: nextOriginLabel,
      returnToOrigin: returnToOrigin ?? trip.returnToOrigin,
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
