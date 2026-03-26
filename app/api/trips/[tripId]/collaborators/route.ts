import { auth } from "@/auth";
import { CollaboratorRole } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { canManageTrip, getTripAccess } from "@/lib/trip-access";
import { NextResponse } from "next/server";

function serializeCollaborator(collaborator: {
  id: string;
  tripId: string;
  userId: string;
  email: string;
  role: CollaboratorRole;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
}) {
  return {
    id: collaborator.id,
    tripId: collaborator.tripId,
    userId: collaborator.userId,
    email: collaborator.email,
    name: collaborator.user.name,
    image: collaborator.user.image,
    role: collaborator.role,
    isOwner: collaborator.role === CollaboratorRole.OWNER,
    createdAt: collaborator.createdAt.toISOString(),
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

  const [owner, collaborators] = await Promise.all([
    prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            email: true,
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.tripCollaborator.findMany({
      where: { tripId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!owner) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json([
    {
      id: `owner-${owner.id}`,
      tripId,
      userId: owner.userId,
      email: owner.user.email,
      name: owner.user.name,
      image: owner.user.image,
      role: "OWNER",
      isOwner: true,
      createdAt: new Date().toISOString(),
    },
    ...collaborators.map(serializeCollaborator),
  ]);
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
  const access = await getTripAccess(tripId, session.user.id);

  if (!canManageTrip(access)) {
    return NextResponse.json({ error: "Only the trip owner can manage collaborators." }, { status: 403 });
  }

  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role =
    body.role === CollaboratorRole.EDITOR || body.role === CollaboratorRole.VIEWER
      ? body.role
      : null;

  if (!email || !role) {
    return NextResponse.json({ error: "email and role are required." }, { status: 400 });
  }

  const [trip, user] = await Promise.all([
    prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, userId: true },
    }),
    prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, image: true },
    }),
  ]);

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  if (!user) {
    return NextResponse.json(
      { error: "That email does not belong to a Wandrly account yet." },
      { status: 404 }
    );
  }

  if (user.id === trip.userId) {
    return NextResponse.json({ error: "The trip owner already has full access." }, { status: 400 });
  }

  const collaborator = await prisma.tripCollaborator.upsert({
    where: {
      tripId_userId: {
        tripId,
        userId: user.id,
      },
    },
    update: {
      email: user.email,
      role,
    },
    create: {
      tripId,
      userId: user.id,
      email: user.email,
      role,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json(serializeCollaborator(collaborator));
}
