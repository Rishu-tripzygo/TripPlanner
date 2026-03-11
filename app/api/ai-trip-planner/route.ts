import {
  AITripPlannerRequest,
  interestOptions,
} from "@/lib/ai-trip-types";
import { NextResponse } from "next/server";

const itinerarySchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "trip_overview",
    "trip_summary",
    "hotel_recommendations",
    "days",
    "local_foods",
    "must_visit_attractions",
    "hidden_gems",
    "transportation_suggestions",
    "travel_tips",
  ],
  properties: {
    trip_overview: { type: "string" },
    trip_summary: {
      type: "object",
      additionalProperties: false,
      required: [
        "destination",
        "purpose",
        "duration_days",
        "travelers",
        "budget_range",
        "travel_style",
        "ideal_area_to_stay",
        "best_time_windows",
      ],
      properties: {
        destination: { type: "string" },
        purpose: { type: "string" },
        duration_days: { type: "number" },
        travelers: { type: "number" },
        budget_range: { type: "string" },
        travel_style: { type: "string" },
        ideal_area_to_stay: { type: "string" },
        best_time_windows: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
    hotel_recommendations: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "price_range",
          "description",
          "recommendation_reason",
        ],
        properties: {
          name: { type: "string" },
          price_range: { type: "string" },
          description: { type: "string" },
          recommendation_reason: { type: "string" },
        },
      },
    },
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "day",
          "title",
          "morning",
          "afternoon",
          "evening",
          "places",
          "food_recommendations",
          "relaxation_suggestions",
          "travel_time_notes",
          "activity_alternatives",
        ],
        properties: {
          day: { type: "number" },
          title: { type: "string" },
          morning: {
            type: "array",
            items: { type: "string" },
          },
          afternoon: {
            type: "array",
            items: { type: "string" },
          },
          evening: {
            type: "array",
            items: { type: "string" },
          },
          places: {
            type: "array",
            items: { type: "string" },
          },
          food_recommendations: {
            type: "array",
            items: { type: "string" },
          },
          relaxation_suggestions: {
            type: "array",
            items: { type: "string" },
          },
          travel_time_notes: {
            type: "array",
            items: { type: "string" },
          },
          activity_alternatives: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
    local_foods: {
      type: "array",
      items: { type: "string" },
    },
    must_visit_attractions: {
      type: "array",
      items: { type: "string" },
    },
    hidden_gems: {
      type: "array",
      items: { type: "string" },
    },
    transportation_suggestions: {
      type: "array",
      items: { type: "string" },
    },
    travel_tips: {
      type: "array",
      items: { type: "string" },
    },
  },
};

function validateRequest(body: Partial<AITripPlannerRequest>) {
  if (!body.destination?.trim()) return "Destination is required.";
  if (!body.purpose?.trim()) return "Trip purpose is required.";
  if (!body.travelStyle?.trim()) return "Travel style is required.";
  if (!body.hotelCategory?.trim()) return "Preferred hotel category is required.";
  if (!Number.isFinite(body.days) || Number(body.days) < 1 || Number(body.days) > 21) {
    return "Number of days must be between 1 and 21.";
  }
  if (
    !Number.isFinite(body.travelers) ||
    Number(body.travelers) < 1 ||
    Number(body.travelers) > 20
  ) {
    return "Number of travelers must be between 1 and 20.";
  }
  if (!Array.isArray(body.interests) || body.interests.length === 0) {
    return "Select at least one interest.";
  }

  const invalidInterest = body.interests.some(
    (interest) => !interestOptions.includes(interest as (typeof interestOptions)[number])
  );

  if (invalidInterest) {
    return "One or more interests are invalid.";
  }

  return null;
}

function buildPrompt(body: AITripPlannerRequest) {
  return [
    `Destination: ${body.destination}`,
    `Purpose: ${body.purpose}`,
    `Days: ${body.days}`,
    `Travelers: ${body.travelers}`,
    `Budget range: ${body.budgetRange?.trim() || "Not specified"}`,
    `Travel style: ${body.travelStyle}`,
    `Interests: ${body.interests.join(", ")}`,
    `Hotel category: ${body.hotelCategory}`,
    `Travel dates: ${body.travelDates?.trim() || "Flexible / not specified"}`,
    "",
    "Generate a polished travel-planner response.",
    "Requirements:",
    "- Create a realistic day-wise itinerary for the full trip.",
    "- Include morning, afternoon, evening items as short action-oriented bullets.",
    "- Include 3 to 5 hotel recommendations aligned to travel style, budget, and location convenience.",
    "- Include local foods, must-visit attractions, hidden gems, transport guidance, and travel tips.",
    "- Include travel time notes between major places when plausible.",
    "- Add activity alternatives for flexibility instead of separate itinerary versions.",
    "- Keep the tone premium, practical, and concise.",
    "- Return only valid JSON matching the schema.",
  ].join("\n");
}

function parseResponsePayload(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "output_text" in data &&
    typeof data.output_text === "string"
  ) {
    return data.output_text;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "output" in data &&
    Array.isArray(data.output)
  ) {
    for (const item of data.output) {
      if (
        typeof item === "object" &&
        item !== null &&
        "content" in item &&
        Array.isArray(item.content)
      ) {
        for (const contentItem of item.content) {
          if (
            typeof contentItem === "object" &&
            contentItem !== null &&
            "text" in contentItem &&
            typeof contentItem.text === "string"
          ) {
            return contentItem.text;
          }
        }
      }
    }
  }

  return null;
}

export async function POST(request: Request) {
  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (!openAiApiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing from the environment." },
      { status: 500 }
    );
  }

  let body: AITripPlannerRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const validationError = validateRequest(body);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const systemPrompt =
    "You are an expert luxury travel planner. Produce practical, city-aware itineraries with realistic pacing, hotel guidance, local food recommendations, hidden gems, and useful alternatives. Never return markdown or prose outside the requested JSON.";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: buildPrompt(body) }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "trip_itinerary",
          schema: itinerarySchema,
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "OpenAI request failed.", details: errorText },
      { status: 502 }
    );
  }

  const data = await response.json();
  const rawJson = parseResponsePayload(data);

  if (!rawJson) {
    return NextResponse.json(
      { error: "AI response did not contain structured JSON." },
      { status: 502 }
    );
  }

  try {
    return NextResponse.json(JSON.parse(rawJson));
  } catch {
    return NextResponse.json(
      { error: "AI returned invalid JSON." },
      { status: 502 }
    );
  }
}
