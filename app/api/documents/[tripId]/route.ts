import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditTrip, getTripAccess } from "@/lib/trip-access";
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
  const access = await getTripAccess(tripId, session.user.id);

  if (!access) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
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
  const access = await getTripAccess(tripId, session.user.id);
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

  if (!access) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  if (!canEditTrip(access)) {
    return NextResponse.json(
      { error: "You can view these documents, but only editors can add or remove them." },
      { status: 403 }
    );
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { tripId } = await params;
  const access = await getTripAccess(tripId, session.user.id);
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId");

  if (!documentId) {
    return NextResponse.json({ error: "documentId is required." }, { status: 400 });
  }

  if (!access) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  if (!canEditTrip(access)) {
    return NextResponse.json(
      { error: "You can view these documents, but only editors can add or remove them." },
      { status: 403 }
    );
  }

  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      tripId,
    },
    select: { id: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  await prisma.document.delete({
    where: { id: document.id },
  });

  return NextResponse.json({ ok: true, documentId: document.id });
}
