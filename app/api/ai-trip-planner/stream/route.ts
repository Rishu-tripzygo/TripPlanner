import { auth } from "@/auth";
import { Prisma } from "@/app/generated/prisma/client";
import { AITripPlannerRequest } from "@/lib/ai-trip-types";
import {
  buildTripPrompt,
  generateStructuredItinerary,
  validateTripPlannerRequest,
} from "@/lib/ai-trip-service";
import { normalizeItineraryForStorage, serializeVersionRecord } from "@/lib/itinerary-utils";
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

  if (!body.tripId) {
    return new Response(JSON.stringify({ error: "tripId is required." }), { status: 400 });
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: body.tripId,
      userId: session.user.id,
    },
    select: {
      id: true,
      itineraryVersions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!trip) {
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

        const nextVersionNumber = (trip.itineraryVersions[0]?.versionNumber || 0) + 1;
        const created = await prisma.$transaction(async (tx) => {
          await tx.itineraryVersion.updateMany({
            where: { tripId: trip.id, isActive: true },
            data: { isActive: false },
          });

          return tx.itineraryVersion.create({
            data: {
              tripId: trip.id,
              versionNumber: nextVersionNumber,
              sourceProvider: provider,
              title: `${body.destination} itinerary`,
              itineraryData: normalizedItinerary as unknown as Prisma.InputJsonValue,
              isActive: true,
            },
          });
        });

        streamEvent(controller, {
          type: "complete",
          version: serializeVersionRecord(created),
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
