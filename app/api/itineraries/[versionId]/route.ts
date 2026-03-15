import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeVersionRecord } from "@/lib/itinerary-utils";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { versionId } = await params;
  const body = await request.json();
  const { itineraryData, setActive } = body;

  const version = await prisma.itineraryVersion.findFirst({
    where: {
      id: versionId,
      trip: {
        userId: session.user.id,
      },
    },
  });

  if (!version) {
    return NextResponse.json({ error: "Itinerary version not found." }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (setActive) {
      await tx.itineraryVersion.updateMany({
        where: { tripId: version.tripId, isActive: true },
        data: { isActive: false },
      });
    }

    return tx.itineraryVersion.update({
      where: { id: version.id },
      data: {
        itineraryData: itineraryData ?? version.itineraryData,
        isActive: setActive ? true : version.isActive,
      },
    });
  });

  return NextResponse.json(serializeVersionRecord(updated));
}
