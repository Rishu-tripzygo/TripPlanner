import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageTrip, getTripAccess } from "@/lib/trip-access";
import { NextResponse } from "next/server";

function normalizeDate(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tripId } = await params;
  const access = await getTripAccess(tripId, session.user.id);
  const body = await request.json();

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const imageUrl =
    typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null;
  const startDate = normalizeDate(body.startDate);
  const endDate = normalizeDate(body.endDate);

  if (!title || !description || !startDate || !endDate) {
    return NextResponse.json(
      { error: "title, description, startDate, and endDate are required." },
      { status: 400 }
    );
  }

  if (endDate < startDate) {
    return NextResponse.json(
      { error: "End date must be the same as or later than start date." },
      { status: 400 }
    );
  }

  if (!canManageTrip(access)) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
    },
    select: {
      id: true,
      itineraryVersions: {
        where: { isActive: true },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const updated = await prisma.trip.update({
    where: { id: trip.id },
    data: {
      title,
      description,
      imageUrl,
      startDate,
      endDate,
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      startDate: true,
      endDate: true,
      routeStatus: true,
      _count: {
        select: {
          locations: true,
        },
      },
    },
  });

  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    description: updated.description,
    imageUrl: updated.imageUrl,
    startDate: updated.startDate.toISOString(),
    endDate: updated.endDate.toISOString(),
    routeStatus: updated.routeStatus,
    confirmedStopsCount: updated._count.locations,
  });
}

export async function DELETE(
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
    select: {
      id: true,
      locations: {
        select: {
          id: true,
        },
      },
      share: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    if (trip.share?.id) {
      await tx.tripBookmark.deleteMany({
        where: { tripShareId: trip.share.id },
      });
      await tx.tripReaction.deleteMany({
        where: { tripShareId: trip.share.id },
      });
      await tx.tripShare.delete({
        where: { id: trip.share.id },
      });
    }

    if (trip.locations.length > 0) {
      await tx.note.deleteMany({
        where: {
          locationId: {
            in: trip.locations.map((location) => location.id),
          },
        },
      });
      await tx.location.deleteMany({
        where: { tripId: trip.id },
      });
    }

    await tx.expense.deleteMany({ where: { tripId: trip.id } });
    await tx.document.deleteMany({ where: { tripId: trip.id } });
    await tx.journalEntry.deleteMany({ where: { tripId: trip.id } });
    await tx.chatMessage.deleteMany({ where: { tripId: trip.id } });
    await tx.itineraryVersion.deleteMany({ where: { tripId: trip.id } });
    await tx.generationRequest.deleteMany({ where: { tripId: trip.id } });
    await tx.packingList.deleteMany({ where: { tripId: trip.id } });
    await tx.budget.deleteMany({ where: { tripId: trip.id } });
    await tx.tripCollaborator.deleteMany({ where: { tripId: trip.id } });
    await tx.trip.delete({ where: { id: trip.id } });
  });

  return NextResponse.json({ ok: true, tripId });
}
