import { auth } from "@/auth";
import { Prisma } from "@/app/generated/prisma/client";
import { buildRefinementPrompt, generateStructuredItinerary } from "@/lib/ai-trip-service";
import { normalizeItineraryForStorage, serializeVersionRecord } from "@/lib/itinerary-utils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  const { versionId } = await params;
  const body = await request.json();
  const instruction =
    typeof body.instruction === "string" ? body.instruction.trim() : "";

  if (!instruction) {
    return NextResponse.json({ error: "instruction is required." }, { status: 400 });
  }

  const version = await prisma.itineraryVersion.findFirst({
    where: {
      id: versionId,
      trip: {
        userId: session.user.id,
      },
    },
    include: {
      trip: true,
    },
  });

  if (!version) {
    return NextResponse.json({ error: "Itinerary version not found." }, { status: 404 });
  }

  const latestVersion = await prisma.itineraryVersion.findFirst({
    where: { tripId: version.tripId },
    orderBy: { versionNumber: "desc" },
    select: { versionNumber: true },
  });

  const systemPrompt =
    "You are an expert travel planning assistant. Update the existing itinerary with precision, preserve unaffected sections, and keep the response practical, elegant, and valid JSON only.";

  try {
    const { itinerary, provider } = await generateStructuredItinerary(
      buildRefinementPrompt(version.itineraryData as never, instruction),
      systemPrompt
    );

    const normalized = normalizeItineraryForStorage(itinerary, {
      destination: itinerary.trip_summary.destination,
      purpose: itinerary.trip_summary.purpose,
      days: itinerary.trip_summary.duration_days,
      travelers: itinerary.trip_summary.travelers,
      budgetRange: itinerary.trip_summary.budget_range,
      travelStyle: itinerary.trip_summary.travel_style,
      interests: [],
      hotelCategory: "",
      travelDates: version.trip.startDate.toISOString(),
      tripId: version.tripId,
    });

    const created = await prisma.$transaction(async (tx) => {
      await tx.chatMessage.create({
        data: {
          userId,
          tripId: version.tripId,
          itineraryVersionId: version.id,
          role: "USER",
          content: instruction,
        },
      });

      await tx.itineraryVersion.updateMany({
        where: { tripId: version.tripId, isActive: true },
        data: { isActive: false },
      });

      const nextVersion = await tx.itineraryVersion.create({
        data: {
          tripId: version.tripId,
          versionNumber: (latestVersion?.versionNumber || 0) + 1,
          sourceProvider: provider,
          sourcePrompt: instruction,
          title: `Refined: ${version.title || itinerary.trip_summary.destination}`,
          itineraryData: normalized as unknown as Prisma.InputJsonValue,
          isActive: true,
        },
      });

      const assistantMessage = await tx.chatMessage.create({
        data: {
          userId,
          tripId: version.tripId,
          itineraryVersionId: nextVersion.id,
          role: "ASSISTANT",
          content: `Updated the itinerary based on: ${instruction}`,
        },
      });

      return {
        nextVersion,
        assistantMessage,
      };
    });

    return NextResponse.json({
      version: serializeVersionRecord(created.nextVersion),
      assistantMessage: {
        id: created.assistantMessage.id,
        role: created.assistantMessage.role,
        content: created.assistantMessage.content,
        createdAt: created.assistantMessage.createdAt.toISOString(),
        itineraryVersionId: created.assistantMessage.itineraryVersionId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to refine itinerary.",
        details: error instanceof Error ? error.message : "Unknown AI provider error.",
      },
      { status: 502 }
    );
  }
}
