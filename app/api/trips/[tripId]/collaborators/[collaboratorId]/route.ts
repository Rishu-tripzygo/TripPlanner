import { auth } from "@/auth";
import { CollaboratorRole } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { canManageTrip, getTripAccess } from "@/lib/trip-access";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; collaboratorId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tripId, collaboratorId } = await params;
  const access = await getTripAccess(tripId, session.user.id);

  if (!canManageTrip(access)) {
    return NextResponse.json({ error: "Only the trip owner can manage collaborators." }, { status: 403 });
  }

  const body = await request.json();
  const role =
    body.role === CollaboratorRole.EDITOR || body.role === CollaboratorRole.VIEWER
      ? body.role
      : null;

  if (!role) {
    return NextResponse.json({ error: "A valid role is required." }, { status: 400 });
  }

  const collaborator = await prisma.tripCollaborator.findFirst({
    where: {
      id: collaboratorId,
      tripId,
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

  if (!collaborator) {
    return NextResponse.json({ error: "Collaborator not found." }, { status: 404 });
  }

  const updated = await prisma.tripCollaborator.update({
    where: { id: collaborator.id },
    data: { role },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json({
    id: updated.id,
    tripId: updated.tripId,
    userId: updated.userId,
    email: updated.email,
    name: updated.user.name,
    image: updated.user.image,
    role: updated.role,
    isOwner: false,
    createdAt: updated.createdAt.toISOString(),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tripId: string; collaboratorId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tripId, collaboratorId } = await params;
  const access = await getTripAccess(tripId, session.user.id);

  if (!canManageTrip(access)) {
    return NextResponse.json({ error: "Only the trip owner can manage collaborators." }, { status: 403 });
  }

  const collaborator = await prisma.tripCollaborator.findFirst({
    where: {
      id: collaboratorId,
      tripId,
    },
    select: { id: true },
  });

  if (!collaborator) {
    return NextResponse.json({ error: "Collaborator not found." }, { status: 404 });
  }

  await prisma.tripCollaborator.delete({
    where: { id: collaborator.id },
  });

  return NextResponse.json({ ok: true, collaboratorId: collaborator.id });
}
