import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RefinementMessage } from "@/lib/phase-one-types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tripId = searchParams.get("tripId");

  if (!tripId) {
    return NextResponse.json({ error: "tripId is required." }, { status: 400 });
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: session.user.id,
    },
    select: {
      chatMessages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const messages: RefinementMessage[] = trip.chatMessages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    itineraryVersionId: message.itineraryVersionId,
  }));

  return NextResponse.json(messages);
}
