import { NextResponse } from "next/server";
import { AITripPlannerRequest } from "@/lib/ai-trip-types";
import {
  buildTripPrompt,
  getAIProviderAttempts,
  getAIProviderOrder,
  generateStructuredItinerary,
  validateTripPlannerRequest,
} from "@/lib/ai-trip-service";
import { createGenerationRequest, updateGenerationRequest } from "@/lib/generation-requests";
import { normalizeItineraryForStorage } from "@/lib/itinerary-utils";
import {
  ensureGuestSessionToken,
  findActiveGuestPreviewBySessionToken,
  saveGuestPreview,
} from "@/lib/guest-preview";

export async function POST(request: Request) {
  let body: AITripPlannerRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const validationError = validateTripPlannerRequest(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const sessionToken = await ensureGuestSessionToken();
  const existingPreview = await findActiveGuestPreviewBySessionToken(sessionToken);

  if (existingPreview) {
    return NextResponse.json(
      {
        error: "Guest preview already generated for this browser session.",
        previewToken: existingPreview.publicToken,
      },
      { status: 409 }
    );
  }

  const systemPrompt =
    "You are an expert luxury travel planner. Produce practical, city-aware itineraries with realistic pacing, hotel guidance, local food recommendations, hidden gems, and useful alternatives. Never return markdown or prose outside the requested JSON.";
  const promptSnapshot = buildTripPrompt(body);
  const generationRequest = await createGenerationRequest({
    requestType: "GUEST_PREVIEW",
    providerOrder: getAIProviderOrder(),
    requestPayload: body,
    promptSnapshot,
  });

  try {
    await updateGenerationRequest(generationRequest.id, {
      status: "GENERATING",
      startedAt: new Date(),
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

    const normalizedItinerary = normalizeItineraryForStorage(itinerary, body);

    await updateGenerationRequest(generationRequest.id, {
      status: "SAVING",
    });

    const guestPreview = await saveGuestPreview({
      sessionToken,
      request: body,
      itinerary: normalizedItinerary,
      provider,
    });

    await updateGenerationRequest(generationRequest.id, {
      status: "COMPLETED",
      providerUsed: provider,
      completedAt: new Date(),
      resultMeta: {
        previewToken: guestPreview.publicToken,
        expiresAt: guestPreview.expiresAt.toISOString(),
      },
    });

    return NextResponse.json({
      previewToken: guestPreview.publicToken,
      provider,
      expiresAt: guestPreview.expiresAt.toISOString(),
    });
  } catch (error) {
    await updateGenerationRequest(generationRequest.id, {
      status: "FAILED",
      errorMessage: error instanceof Error ? error.message : "Unable to generate guest preview.",
      attemptLog: getAIProviderAttempts(error),
      completedAt: new Date(),
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to generate guest preview.",
      },
      { status: 502 }
    );
  }
}
