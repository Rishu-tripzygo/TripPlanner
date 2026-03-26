import { auth } from "@/auth";
import { Prisma } from "@/app/generated/prisma/client";
import { AITripPlannerRequest } from "@/lib/ai-trip-types";
import {
  buildTripPrompt,
  getAIProviderAttempts,
  getAIProviderOrder,
  generateStructuredItinerary,
  validateTripPlannerRequest,
} from "@/lib/ai-trip-service";
import { createGenerationRequest, updateGenerationRequest } from "@/lib/generation-requests";
import {
  buildTripSeedFromPlanner,
  normalizeItineraryForStorage,
  serializeVersionRecord,
} from "@/lib/itinerary-utils";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/request-rate-limit";
import { buildRouteStateForActiveVersion } from "@/lib/trip-route-state";

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
  const generationLimit = Number(process.env.AI_GENERATION_LIMIT_PER_HOUR || 8);
  const generationRate = checkRateLimit({
    scope: "ai-generation",
    key: userId,
    limit: Number.isFinite(generationLimit) ? generationLimit : 8,
    windowMs: 60 * 60 * 1000,
  });

  if (!generationRate.allowed) {
    return new Response(
      JSON.stringify({
        error:
          "You have reached the current itinerary generation limit. Please wait a bit before trying again.",
      }),
      {
        status: 429,
        headers: {
          "Retry-After": String(generationRate.retryAfterSeconds),
        },
      }
    );
  }

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
          routeStatus: true,
          routeSourceVersionId: true,
          startDate: true,
          endDate: true,
          _count: {
            select: {
              locations: true,
            },
          },
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
  const promptSnapshot = buildTripPrompt(body);
  const generationRequest = await createGenerationRequest({
    userId,
    tripId: existingTrip?.id,
    requestType: "ITINERARY",
    providerOrder: getAIProviderOrder(),
    requestPayload: body,
    promptSnapshot,
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        streamEvent(controller, {
          type: "request",
          requestId: generationRequest.id,
        });

        await updateGenerationRequest(generationRequest.id, {
          status: "GENERATING",
          startedAt: new Date(),
        });

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

        const { itinerary, provider, attempts } = await generateStructuredItinerary(
          promptSnapshot,
          systemPrompt
        );

        await updateGenerationRequest(generationRequest.id, {
          status: "FORMATTING",
          providerUsed: provider,
          attemptLog: attempts,
          resultMeta: {
            destination: itinerary.trip_summary.destination,
            durationDays: itinerary.trip_summary.duration_days,
            travelers: itinerary.trip_summary.travelers,
          },
        });

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

        await updateGenerationRequest(generationRequest.id, {
          status: "SAVING",
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
                routeStatus: true,
                _count: {
                  select: {
                    locations: true,
                  },
                },
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
              sourcePrompt: promptSnapshot,
              title: `${normalizedItinerary.trip_summary.destination} itinerary`,
              itineraryData: normalizedItinerary as unknown as Prisma.InputJsonValue,
              isActive: true,
            },
          });

          const syncedTrip = await tx.trip.update({
            where: { id: tripRecord.id },
            data: buildRouteStateForActiveVersion({
              itinerary: normalizedItinerary,
              activeVersionId: version.id,
              confirmedLocationCount: existingTrip?._count.locations || 0,
              currentRouteSourceVersionId: existingTrip?.routeSourceVersionId || null,
            }),
            select: {
              id: true,
              title: true,
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

          return { trip: syncedTrip, version };
        });

        await updateGenerationRequest(generationRequest.id, {
          status: "COMPLETED",
          tripId: created.trip.id,
          providerUsed: provider,
          completedAt: new Date(),
          resultMeta: {
            tripId: created.trip.id,
            tripTitle: created.trip.title,
            itineraryVersionId: created.version.id,
            wasAutoCreated: !existingTrip,
            routeStatus: created.trip.routeStatus,
            confirmedStopsCount: created.trip._count.locations,
          },
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
            routeStatus: created.trip.routeStatus,
            confirmedStopsCount: created.trip._count.locations,
          },
        });
      } catch (error) {
        await updateGenerationRequest(generationRequest.id, {
          status: "FAILED",
          errorMessage:
            error instanceof Error
              ? error.message
              : "Failed to stream itinerary generation.",
          attemptLog: getAIProviderAttempts(error),
          completedAt: new Date(),
        });

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
