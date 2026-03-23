import { auth } from "@/auth";
import { generateAssistantReply } from "@/lib/assistant-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
