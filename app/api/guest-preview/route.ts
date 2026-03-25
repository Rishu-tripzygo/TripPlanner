import { NextResponse } from "next/server";
import { AITripPlannerRequest } from "@/lib/ai-trip-types";
import {
  buildTripPrompt,
  generateStructuredItinerary,
  validateTripPlannerRequest,
} from "@/lib/ai-trip-service";
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

  try {
    const { itinerary, provider } = await generateStructuredItinerary(
      buildTripPrompt(body),
      systemPrompt
    );

    const normalizedItinerary = normalizeItineraryForStorage(itinerary, body);
    const guestPreview = await saveGuestPreview({
      sessionToken,
      request: body,
      itinerary: normalizedItinerary,
      provider,
    });

    return NextResponse.json({
      previewToken: guestPreview.publicToken,
      provider,
      expiresAt: guestPreview.expiresAt.toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to generate guest preview.",
      },
      { status: 502 }
    );
  }
}
