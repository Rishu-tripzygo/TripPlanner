import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageTrip, getTripAccess } from "@/lib/trip-access";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

function serializeShare(share: {
  id: string;
  tripId: string;
  token: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: share.id,
    tripId: share.tripId,
    token: share.token,
    isPublic: share.isPublic,
    createdAt: share.createdAt.toISOString(),
    updatedAt: share.updatedAt.toISOString(),
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
  const access = await getTripAccess(tripId, session.user.id);

  if (!access) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
    },
    include: {
      share: true,
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const share =
    trip.share ||
    (await prisma.tripShare.create({
      data: {
        tripId: trip.id,
        token: randomUUID(),
        isPublic: false,
      },
    }));

  return NextResponse.json({
    ...serializeShare(share),
    viewerRole: access.role,
    canManage: canManageTrip(access),
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
  const access = await getTripAccess(tripId, session.user.id);
  const body = await request.json();
  const isPublic = Boolean(body?.isPublic);

  if (!access) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  if (!canManageTrip(access)) {
    return NextResponse.json(
      { error: "Only the trip owner can change public sharing." },
      { status: 403 }
    );
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
    },
    include: {
      share: true,
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const share = trip.share
    ? await prisma.tripShare.update({
        where: { tripId: trip.id },
        data: { isPublic },
      })
    : await prisma.tripShare.create({
        data: {
          tripId: trip.id,
          token: randomUUID(),
          isPublic,
        },
      });

  return NextResponse.json({
    ...serializeShare(share),
    viewerRole: access.role,
    canManage: true,
  });
}
