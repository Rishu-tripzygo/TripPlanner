import {
  AITripPlannerRequest,
  AITripPlannerResponse,
  interestOptions,
} from "@/lib/ai-trip-types";

export type AIProvider = "gemini" | "openai";

export const itinerarySchema = {
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
          morning: { type: "array", items: { type: "string" } },
          afternoon: { type: "array", items: { type: "string" } },
          evening: { type: "array", items: { type: "string" } },
          places: { type: "array", items: { type: "string" } },
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
    local_foods: { type: "array", items: { type: "string" } },
    must_visit_attractions: { type: "array", items: { type: "string" } },
    hidden_gems: { type: "array", items: { type: "string" } },
    transportation_suggestions: { type: "array", items: { type: "string" } },
    travel_tips: { type: "array", items: { type: "string" } },
  },
} as const;

export function validateTripPlannerRequest(body: Partial<AITripPlannerRequest>) {
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
    (interest) =>
      !interestOptions.includes(interest as (typeof interestOptions)[number])
  );

  if (invalidInterest) {
    return "One or more interests are invalid.";
  }

  return null;
}

export function buildTripPrompt(body: AITripPlannerRequest) {
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

export function buildRefinementPrompt(
  currentItinerary: AITripPlannerResponse,
  instruction: string
) {
  return [
    "Current itinerary JSON:",
    JSON.stringify(currentItinerary, null, 2),
    "",
    `Refinement instruction: ${instruction}`,
    "",
    "Update the itinerary while preserving its overall JSON structure.",
    "Requirements:",
    "- Apply the user request precisely.",
    "- Keep unaffected sections stable unless a change is needed for consistency.",
    "- If one day changes, only adjust related nearby recommendations if necessary.",
    "- Return only valid JSON matching the same schema.",
  ].join("\n");
}

function parseOpenAIResponse(data: unknown) {
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

function parseGeminiResponse(data: unknown) {
  if (
    typeof data !== "object" ||
    data === null ||
    !("candidates" in data) ||
    !Array.isArray(data.candidates)
  ) {
    return null;
  }

  for (const candidate of data.candidates) {
    if (
      typeof candidate === "object" &&
      candidate !== null &&
      "content" in candidate &&
      typeof candidate.content === "object" &&
      candidate.content !== null &&
      "parts" in candidate.content &&
      Array.isArray(candidate.content.parts)
    ) {
      for (const part of candidate.content.parts) {
        if (
          typeof part === "object" &&
          part !== null &&
          "text" in part &&
          typeof part.text === "string"
        ) {
          return part.text;
        }
      }
    }
  }

  return null;
}

function toGeminiSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) {
    return schema.map(toGeminiSchema);
  }

  if (!schema || typeof schema !== "object") {
    return schema;
  }

  const input = schema as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (key === "additionalProperties") {
      continue;
    }

    if (key === "type" && typeof value === "string") {
      output[key] = value.toUpperCase();
      continue;
    }

    if (key === "properties" && value && typeof value === "object") {
      output[key] = Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([propKey, propValue]) => [
          propKey,
          toGeminiSchema(propValue),
        ])
      );
      continue;
    }

    output[key] = toGeminiSchema(value);
  }

  return output;
}

function hasUsableOpenAIKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  return !!key && !key.startsWith("your-");
}

function hasUsableGeminiKey() {
  const key = process.env.GEMINI_API_KEY?.trim();
  return !!key;
}

function getProviderOrder(): AIProvider[] {
  const configuredOrder =
    process.env.AI_PROVIDER_ORDER?.split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean) || [];

  const validProviders = configuredOrder.filter(
    (value): value is AIProvider => value === "gemini" || value === "openai"
  );

  if (validProviders.length > 0) {
    return validProviders.filter((provider) => {
      if (provider === "gemini") return hasUsableGeminiKey();
      return hasUsableOpenAIKey();
    });
  }

  return (["gemini", "openai"] as AIProvider[]).filter((provider) => {
    if (provider === "gemini") return hasUsableGeminiKey();
    return hasUsableOpenAIKey();
  });
}

async function generateWithOpenAI(prompt: string, systemPrompt: string) {
  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (!hasUsableOpenAIKey() || !openAiApiKey) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

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
          content: [{ type: "input_text", text: prompt }],
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
    throw new Error(`OpenAI request failed: ${await response.text()}`);
  }

  const data = await response.json();
  const rawJson = parseOpenAIResponse(data);
  if (!rawJson) {
    throw new Error("OpenAI response did not contain structured JSON.");
  }

  return JSON.parse(rawJson) as AITripPlannerResponse;
}

async function generateWithGemini(prompt: string, systemPrompt: string) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!hasUsableGeminiKey() || !geminiApiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: toGeminiSchema(itinerarySchema),
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${await response.text()}`);
  }

  const data = await response.json();
  const rawJson = parseGeminiResponse(data);
  if (!rawJson) {
    throw new Error("Gemini response did not contain structured JSON.");
  }

  return JSON.parse(rawJson) as AITripPlannerResponse;
}

export async function generateStructuredItinerary(
  prompt: string,
  systemPrompt: string
) {
  const errors: string[] = [];

  for (const provider of getProviderOrder()) {
    try {
      const itinerary =
        provider === "gemini"
          ? await generateWithGemini(prompt, systemPrompt)
          : await generateWithOpenAI(prompt, systemPrompt);

      return { itinerary, provider };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : `Unknown ${provider} error.`;
      errors.push(`${provider}: ${message}`);
    }
  }

  throw new Error(errors.join(" | "));
}
