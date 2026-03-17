import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTripDestinationForecasts } from "@/lib/weather-service";
import { NextResponse } from "next/server";

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
    select: {
      startDate: true,
      endDate: true,
      locations: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          locationTitle: true,
          lat: true,
          lng: true,
        },
      },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const forecasts = await getTripDestinationForecasts({
    tripStartDate: trip.startDate,
    tripEndDate: trip.endDate,
    locations: trip.locations,
  });

  return NextResponse.json(forecasts);
}
