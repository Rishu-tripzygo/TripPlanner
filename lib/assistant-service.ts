import { prisma } from "@/lib/prisma";

type Provider = "gemini" | "openai";

const DEFAULT_PROVIDER_ORDER: Provider[] = ["openai", "gemini"];

function hasUsableOpenAIKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  return !!key && !key.startsWith("your-");
}

function hasUsableGeminiKey() {
  return !!process.env.GEMINI_API_KEY?.trim();
}

function getProviderOrder(): Provider[] {
  const configured =
    process.env.AI_PROVIDER_ORDER?.split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean) || [];

  const providers = (configured.length > 0
    ? configured
    : DEFAULT_PROVIDER_ORDER) as Provider[];

  return providers.filter((provider) => {
    if (provider === "gemini") return hasUsableGeminiKey();
    return hasUsableOpenAIKey();
  });
}

async function getTripContext(userId: string, tripId?: string) {
  if (!tripId) return null;

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId,
    },
    include: {
      locations: {
        orderBy: { order: "asc" },
      },
      budget: true,
      itineraryVersions: {
        where: { isActive: true },
        take: 1,
      },
    },
  });

  if (!trip) return null;

  return {
    title: trip.title,
    description: trip.description,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    budget: trip.budget
      ? {
          totalBudget: trip.budget.totalBudget,
          currency: trip.budget.currency,
        }
      : null,
    locations: trip.locations.map((location) => location.locationTitle),
    activeItinerary: trip.itineraryVersions[0]?.itineraryData || null,
  };
}

async function generateWithOpenAI(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !hasUsableOpenAIKey()) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${JSON.stringify(data)}`);
  }

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  throw new Error("OpenAI returned no assistant text.");
}

async function generateWithGemini(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !hasUsableGeminiKey()) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Gemini request failed: ${JSON.stringify(data)}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.find(
    (part: { text?: string }) => typeof part.text === "string"
  )?.text;

  if (text?.trim()) {
    return text.trim();
  }

  throw new Error("Gemini returned no assistant text.");
}

export async function generateAssistantReply(input: {
  userId: string;
  question: string;
  tripId?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  const tripContext = await getTripContext(input.userId, input.tripId);
  const systemPrompt =
    "You are Wandrly Assistant, a premium travel planning copilot. Give concise, practical, high-signal answers. Prefer structured guidance, mention uncertainty when needed, and keep responses easy to act on.";

  const historyBlock =
    input.history && input.history.length > 0
      ? `Conversation history:\n${input.history
          .slice(-8)
          .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
          .join("\n")}\n\n`
      : "";

  const contextBlock = tripContext
    ? `Current trip context:\n${JSON.stringify(tripContext, null, 2)}\n\n`
    : "No active trip context is attached.\n\n";

  const userPrompt = `${historyBlock}${contextBlock}User question: ${input.question}`;

  const errors: string[] = [];
  for (const provider of getProviderOrder()) {
    try {
      const content =
        provider === "gemini"
          ? await generateWithGemini(systemPrompt, userPrompt)
          : await generateWithOpenAI(systemPrompt, userPrompt);

      return { content, provider };
    } catch (error) {
      errors.push(`${provider}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  throw new Error(errors.join(" | ") || "No configured AI provider is available.");
}
