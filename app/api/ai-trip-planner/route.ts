import { AITripPlannerRequest } from "@/lib/ai-trip-types";
import {
  buildTripPrompt,
  generateStructuredItinerary,
  validateTripPlannerRequest,
} from "@/lib/ai-trip-service";
import { NextResponse } from "next/server";

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

  const systemPrompt =
    "You are an expert luxury travel planner. Produce practical, city-aware itineraries with realistic pacing, hotel guidance, local food recommendations, hidden gems, and useful alternatives. Never return markdown or prose outside the requested JSON.";

  try {
    const { itinerary, provider } = await generateStructuredItinerary(
      buildTripPrompt(body),
      systemPrompt
    );

    return NextResponse.json(itinerary, {
      headers: {
        "x-ai-provider": provider,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "All configured AI providers failed.",
        details: error instanceof Error ? error.message : "Unknown AI provider error.",
      },
      { status: 502 }
    );
  }
}
