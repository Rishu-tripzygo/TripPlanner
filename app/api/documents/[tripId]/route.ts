import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function serializeDocument(document: {
  id: string;
  tripId: string;
  name: string;
  type: string;
  url: string;
  expiryDate: Date | null;
  createdAt: Date;
}) {
  return {
    id: document.id,
    tripId: document.tripId,
    name: document.name,
    type: document.type,
    url: document.url,
    expiryDate: document.expiryDate?.toISOString() || null,
    createdAt: document.createdAt.toISOString(),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tripId } = await params;

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: session.user.id,
    },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json(trip.documents.map(serializeDocument));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tripId } = await params;
  const body = await request.json();

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const expiryDate =
    typeof body.expiryDate === "string" && body.expiryDate
      ? new Date(body.expiryDate)
      : null;

  if (!name || !type || !url) {
    return NextResponse.json(
      { error: "name, type, and url are required." },
      { status: 400 }
    );
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const document = await prisma.document.create({
    data: {
      tripId,
      name,
      type,
      url,
      expiryDate,
    },
  });

  return NextResponse.json(serializeDocument(document));
}
