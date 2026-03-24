import { auth } from "@/auth";
import { Prisma } from "@/app/generated/prisma/client";
import { AITripPlannerRequest } from "@/lib/ai-trip-types";
import {
  buildTripPrompt,
  generateStructuredItinerary,
  validateTripPlannerRequest,
} from "@/lib/ai-trip-service";
import {
  buildTripSeedFromPlanner,
  normalizeItineraryForStorage,
  serializeVersionRecord,
} from "@/lib/itinerary-utils";
import { prisma } from "@/lib/prisma";

function streamEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  payload: Record<string, unknown>
) {
  controller.enqueue(new TextEncoder().encode(`${JSON.stringify(payload)}\n`));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const userId = session.user.id;

  let body: AITripPlannerRequest;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload." }), {
      status: 400,
    });
  }

  const validationError = validateTripPlannerRequest(body);
  if (validationError) {
    return new Response(JSON.stringify({ error: validationError }), { status: 400 });
  }

  const existingTrip = body.tripId
    ? await prisma.trip.findFirst({
        where: {
          id: body.tripId,
          userId: session.user.id,
        },
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          itineraryVersions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
        },
      })
    : null;

  if (body.tripId && !existingTrip) {
    return new Response(JSON.stringify({ error: "Trip not found." }), { status: 404 });
  }

  const systemPrompt =
    "You are an expert luxury travel planner. Produce practical, city-aware itineraries with realistic pacing, hotel guidance, local food recommendations, hidden gems, and useful alternatives. Never return markdown or prose outside the requested JSON.";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        streamEvent(controller, {
          type: "status",
          stage: "queued",
          message: "Preparing your trip brief",
        });

        streamEvent(controller, {
          type: "status",
          stage: "generating",
          message: "Generating a structured itinerary with AI",
        });

        const { itinerary, provider } = await generateStructuredItinerary(
          buildTripPrompt(body),
          systemPrompt
        );

        streamEvent(controller, {
          type: "status",
          stage: "formatting",
          message: "Formatting the itinerary and building trip insights",
        });

        const normalizedItinerary = normalizeItineraryForStorage(itinerary, body);

        for (const word of itinerary.trip_overview.split(/\s+/)) {
          if (!word) continue;
          streamEvent(controller, {
            type: "overview_chunk",
            text: `${word} `,
          });
          await new Promise((resolve) => setTimeout(resolve, 22));
        }

        streamEvent(controller, {
          type: "status",
          stage: "saving",
          message: "Saving this version to your trip",
        });

        const tripSeed = buildTripSeedFromPlanner(body, normalizedItinerary);
        const created = await prisma.$transaction(async (tx) => {
          const tripRecord =
            existingTrip ||
            (await tx.trip.create({
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
            }));

          const lastVersion = existingTrip?.itineraryVersions[0]
            ? existingTrip.itineraryVersions[0]
            : await tx.itineraryVersion.findFirst({
                where: { tripId: tripRecord.id },
                orderBy: { versionNumber: "desc" },
              });

          await tx.itineraryVersion.updateMany({
            where: { tripId: tripRecord.id, isActive: true },
            data: { isActive: false },
          });

          const version = await tx.itineraryVersion.create({
            data: {
              tripId: tripRecord.id,
              versionNumber: (lastVersion?.versionNumber || 0) + 1,
              sourceProvider: provider,
              title: `${normalizedItinerary.trip_summary.destination} itinerary`,
              itineraryData: normalizedItinerary as unknown as Prisma.InputJsonValue,
              isActive: true,
            },
          });

          if (normalizedItinerary.total_estimated_cost) {
            await tx.budget.upsert({
              where: { tripId: tripRecord.id },
              create: {
                tripId: tripRecord.id,
                totalBudget: normalizedItinerary.total_estimated_cost.total,
                currency: normalizedItinerary.total_estimated_cost.currency,
                accommodation: normalizedItinerary.total_estimated_cost.accommodation,
                food: normalizedItinerary.total_estimated_cost.food,
                transport: normalizedItinerary.total_estimated_cost.transport,
                activities: normalizedItinerary.total_estimated_cost.activities,
                misc: normalizedItinerary.total_estimated_cost.misc,
              },
              update: {
                totalBudget: normalizedItinerary.total_estimated_cost.total,
                currency: normalizedItinerary.total_estimated_cost.currency,
                accommodation: normalizedItinerary.total_estimated_cost.accommodation,
                food: normalizedItinerary.total_estimated_cost.food,
                transport: normalizedItinerary.total_estimated_cost.transport,
                activities: normalizedItinerary.total_estimated_cost.activities,
                misc: normalizedItinerary.total_estimated_cost.misc,
              },
            });
          }

          if (!existingTrip) {
            await tx.notification.create({
              data: {
                userId,
                type: "AI_TRIP_CREATED",
                tripId: tripRecord.id,
                message: `Your AI itinerary for ${tripRecord.title} is ready in Trips.`,
              },
            });
          }

          return { trip: tripRecord, version };
        });

        streamEvent(controller, {
          type: "complete",
          version: serializeVersionRecord(created.version),
          trip: {
            id: created.trip.id,
            title: created.trip.title,
            startDate: created.trip.startDate.toISOString(),
            endDate: created.trip.endDate.toISOString(),
            wasAutoCreated: !existingTrip,
          },
        });
      } catch (error) {
        streamEvent(controller, {
          type: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to stream itinerary generation.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
