import { auth } from "@/auth";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeItineraryForStorage, serializeVersionRecord } from "@/lib/itinerary-utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tripId = searchParams.get("tripId");

  if (!tripId) {
    return NextResponse.json({ error: "tripId is required." }, { status: 400 });
  }

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
    select: {
      itineraryVersions: {
        orderBy: { versionNumber: "desc" },
      },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json(
    trip.itineraryVersions.map((version) => serializeVersionRecord(version))
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { tripId, itinerary, requestPayload, sourceProvider, sourcePrompt, title } = body;

  if (!tripId || !itinerary || !requestPayload || !sourceProvider) {
    return NextResponse.json(
      { error: "tripId, itinerary, requestPayload, and sourceProvider are required." },
      { status: 400 }
    );
  }

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
    select: {
      id: true,
      itineraryVersions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const nextVersion = (trip.itineraryVersions[0]?.versionNumber || 0) + 1;
  const normalizedItinerary = normalizeItineraryForStorage(itinerary, requestPayload);

  const created = await prisma.$transaction(async (tx) => {
    await tx.itineraryVersion.updateMany({
      where: { tripId: trip.id, isActive: true },
      data: { isActive: false },
    });

    return tx.itineraryVersion.create({
      data: {
        tripId: trip.id,
        versionNumber: nextVersion,
        sourceProvider,
        sourcePrompt,
        title,
        itineraryData: normalizedItinerary as unknown as Prisma.InputJsonValue,
        isActive: true,
      },
    });
  });

  return NextResponse.json(serializeVersionRecord(created));
}
