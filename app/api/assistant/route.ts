import { auth } from "@/auth";
import { generateAssistantReply } from "@/lib/assistant-service";
import { checkRateLimit } from "@/lib/request-rate-limit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assistantLimit = Number(process.env.ASSISTANT_LIMIT_PER_MINUTE || 12);
  const assistantRate = checkRateLimit({
    scope: "assistant",
    key: session.user.id,
    limit: Number.isFinite(assistantLimit) ? assistantLimit : 12,
    windowMs: 60 * 1000,
  });

  if (!assistantRate.allowed) {
    return NextResponse.json(
      {
        error: "You are sending messages too quickly. Please wait a moment and try again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(assistantRate.retryAfterSeconds),
        },
      }
    );
  }

  try {
    const body = (await request.json()) as {
      question?: string;
      tripId?: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!body.question?.trim()) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    const response = await generateAssistantReply({
      userId: session.user.id,
      question: body.question,
      tripId: body.tripId,
      history: body.history,
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Assistant request failed.",
        details: error instanceof Error ? error.message : "Unknown assistant error.",
      },
      { status: 502 }
    );
  }
}
