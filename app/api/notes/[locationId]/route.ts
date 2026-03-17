import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function serializeNote(note: {
  id: string;
  locationId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: note.id,
    locationId: note.locationId,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { locationId } = await params;
  const location = await prisma.location.findFirst({
    where: {
      id: locationId,
      trip: {
        userId: session.user.id,
      },
    },
    include: {
      notes: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found." }, { status: 404 });
  }

  return NextResponse.json(location.notes.map(serializeNote));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { locationId } = await params;
  const body = await request.json();
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content) {
    return NextResponse.json({ error: "content is required." }, { status: 400 });
  }

  const location = await prisma.location.findFirst({
    where: {
      id: locationId,
      trip: {
        userId: session.user.id,
      },
    },
    select: { id: true },
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found." }, { status: 404 });
  }

  const note = await prisma.note.create({
    data: {
      locationId,
      content,
    },
  });

  return NextResponse.json(serializeNote(note));
}
