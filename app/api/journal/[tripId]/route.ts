import { auth } from "@/auth";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function serializeEntry(entry: {
  id: string;
  tripId: string;
  day: number;
  content: string;
  photos: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: entry.id,
    tripId: entry.tripId,
    day: entry.day,
    content: entry.content,
    photos: (entry.photos as string[]) || [],
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

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
      journalEntries: {
        orderBy: { day: "asc" },
      },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json(trip.journalEntries.map(serializeEntry));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tripId } = await params;
  const body = await request.json();
  const day = Number(body.day);
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const photos = Array.isArray(body.photos)
    ? body.photos.filter((photo: unknown): photo is string => typeof photo === "string")
    : [];

  if (!Number.isFinite(day) || day < 1) {
    return NextResponse.json({ error: "A valid day is required." }, { status: 400 });
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

  const entry = await prisma.journalEntry.upsert({
    where: {
      tripId_day: {
        tripId,
        day,
      },
    },
    update: {
      content,
      photos: photos as unknown as Prisma.InputJsonValue,
    },
    create: {
      tripId,
      day,
      content,
      photos: photos as unknown as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json(serializeEntry(entry));
}
