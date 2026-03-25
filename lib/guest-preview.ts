import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { AITripPlannerRequest } from "@/lib/ai-trip-types";
import { PersistedItinerary } from "@/lib/phase-one-types";
import { buildTripSeedFromPlanner } from "@/lib/itinerary-utils";

export const GUEST_PREVIEW_COOKIE = "wandrly_guest_session";
const GUEST_PREVIEW_TTL_MS = 1000 * 60 * 60;

export function createGuestSessionToken() {
  return randomUUID();
}

export function createGuestPublicToken() {
  return randomUUID().replace(/-/g, "");
}

export async function getGuestSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_PREVIEW_COOKIE)?.value ?? null;
}

export async function ensureGuestSessionToken() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(GUEST_PREVIEW_COOKIE)?.value;

  if (existing) {
    return existing;
  }

  const token = createGuestSessionToken();
  cookieStore.set(GUEST_PREVIEW_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GUEST_PREVIEW_TTL_MS / 1000,
  });
  return token;
}

export async function clearGuestSessionToken() {
  const cookieStore = await cookies();
  cookieStore.delete(GUEST_PREVIEW_COOKIE);
}

export async function findActiveGuestPreviewBySessionToken(sessionToken: string) {
  return prisma.guestPreview.findFirst({
    where: {
      sessionToken,
      claimedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
}

export async function findGuestPreviewByPublicToken(publicToken: string) {
  return prisma.guestPreview.findFirst({
    where: {
      publicToken,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
}

export async function saveGuestPreview(args: {
  sessionToken: string;
  request: AITripPlannerRequest;
  itinerary: PersistedItinerary;
  provider: string;
}) {
  const expiresAt = new Date(Date.now() + GUEST_PREVIEW_TTL_MS);
  const existing = await prisma.guestPreview.findUnique({
    where: { sessionToken: args.sessionToken },
  });

  if (existing?.claimedAt === null && existing.expiresAt > new Date()) {
    throw new Error("PREVIEW_ALREADY_EXISTS");
  }

  return prisma.guestPreview.upsert({
    where: { sessionToken: args.sessionToken },
    update: {
      publicToken: existing?.publicToken || createGuestPublicToken(),
      destination: args.request.destination,
      plannerInput: args.request as unknown as Prisma.InputJsonValue,
      itineraryData: args.itinerary as unknown as Prisma.InputJsonValue,
      sourceProvider: args.provider,
      title: args.itinerary.trip_summary.destination,
      expiresAt,
      claimedAt: null,
      convertedTripId: null,
    },
    create: {
      sessionToken: args.sessionToken,
      publicToken: createGuestPublicToken(),
      destination: args.request.destination,
      plannerInput: args.request as unknown as Prisma.InputJsonValue,
      itineraryData: args.itinerary as unknown as Prisma.InputJsonValue,
      sourceProvider: args.provider,
      title: args.itinerary.trip_summary.destination,
      expiresAt,
    },
  });
}

export async function claimGuestPreviewToUser(sessionToken: string, userId: string) {
  const guestPreview = await prisma.guestPreview.findFirst({
    where: {
      sessionToken,
      claimedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!guestPreview) {
    return null;
  }

  const plannerInput = guestPreview.plannerInput as unknown as AITripPlannerRequest;
  const itinerary = guestPreview.itineraryData as unknown as PersistedItinerary;
  const tripSeed = buildTripSeedFromPlanner(plannerInput, itinerary);

  const result = await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.create({
      data: {
        userId,
        ...tripSeed,
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
      },
    });

    await tx.itineraryVersion.create({
      data: {
        tripId: trip.id,
        versionNumber: 1,
        sourceProvider: guestPreview.sourceProvider,
        title: `${itinerary.trip_summary.destination} itinerary`,
        itineraryData: itinerary as unknown as Prisma.InputJsonValue,
        isActive: true,
      },
    });

    if (itinerary.total_estimated_cost) {
      await tx.budget.create({
        data: {
          tripId: trip.id,
          totalBudget: itinerary.total_estimated_cost.total,
          currency: itinerary.total_estimated_cost.currency,
          accommodation: itinerary.total_estimated_cost.accommodation,
          food: itinerary.total_estimated_cost.food,
          transport: itinerary.total_estimated_cost.transport,
          activities: itinerary.total_estimated_cost.activities,
          misc: itinerary.total_estimated_cost.misc,
        },
      });
    }

    await tx.guestPreview.update({
      where: { id: guestPreview.id },
      data: {
        userId,
        claimedAt: new Date(),
        convertedTripId: trip.id,
      },
    });

    await tx.notification.create({
      data: {
        userId,
        type: "GUEST_PREVIEW_IMPORTED",
        tripId: trip.id,
        message: `Your guest preview for ${trip.title} is now saved in Trips.`,
      },
    });

    return trip;
  });

  return result;
}
