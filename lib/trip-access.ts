import { CollaboratorRole } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type TripAccess = {
  tripId: string;
  ownerId: string;
  role: CollaboratorRole;
  isOwner: boolean;
};

export async function getTripAccess(tripId: string, userId: string): Promise<TripAccess | null> {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      OR: [
        { userId },
        {
          collaborators: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      userId: true,
      collaborators: {
        where: { userId },
        select: { role: true },
        take: 1,
      },
    },
  });

  if (!trip) return null;

  const isOwner = trip.userId === userId;
  const role = isOwner ? CollaboratorRole.OWNER : trip.collaborators[0]?.role;

  if (!role) return null;

  return {
    tripId: trip.id,
    ownerId: trip.userId,
    role,
    isOwner,
  };
}

export function canEditTrip(access: TripAccess | null) {
  return access?.role === CollaboratorRole.OWNER || access?.role === CollaboratorRole.EDITOR;
}

export function canManageTrip(access: TripAccess | null) {
  return access?.role === CollaboratorRole.OWNER;
}
