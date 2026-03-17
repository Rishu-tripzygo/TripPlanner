import { auth } from "@/auth";
import { Prisma } from "@/app/generated/prisma/client";
import { generatePackingItems } from "@/lib/packing-list";
import { prisma } from "@/lib/prisma";
import { PackingItem } from "@/lib/phase-one-types";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tripId } = await params;

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: session.user.id,
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
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  if (trip.packingList) {
    return NextResponse.json({
      id: trip.packingList.id,
      tripId: trip.packingList.tripId,
      template: trip.packingList.template,
      items: trip.packingList.items,
    });
  }

  const generatedItems = generatePackingItems({
    tripTitle: trip.title,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    destinationNames: trip.locations.map((location) => location.locationTitle),
    itinerary:
      (trip.itineraryVersions[0]?.itineraryData as never) || null,
  });

  const packingList = await prisma.packingList.create({
    data: {
      tripId: trip.id,
      template: "Smart AI pack",
      items: generatedItems as unknown as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({
    id: packingList.id,
    tripId: packingList.tripId,
    template: packingList.template,
    items: packingList.items,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tripId } = await params;
  const body = await request.json();
  const template = typeof body.template === "string" ? body.template : "Custom";
  const items = Array.isArray(body.items) ? (body.items as PackingItem[]) : null;

  if (!items) {
    return NextResponse.json({ error: "items are required." }, { status: 400 });
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const packingList = await prisma.packingList.upsert({
    where: { tripId },
    update: {
      template,
      items: items as unknown as Prisma.InputJsonValue,
    },
    create: {
      tripId,
      template,
      items: items as unknown as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({
    id: packingList.id,
    tripId: packingList.tripId,
    template: packingList.template,
    items: packingList.items,
  });
}
