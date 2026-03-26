import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditTrip, getTripAccess } from "@/lib/trip-access";
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
  const access = await getTripAccess(tripId, session.user.id);

  if (!access) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
    },
    include: {
      budget: true,
      expenses: {
        orderBy: { expenseDate: "desc" },
      },
      itineraryVersions: {
        where: { isActive: true },
        take: 1,
      },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json({
    budget: trip.budget,
    expenses: trip.expenses,
    activeItinerary: trip.itineraryVersions[0]?.itineraryData ?? null,
  });
}

export async function PUT(
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

  const totalBudget = Number(body.totalBudget);
  const accommodation = Number(body.accommodation || 0);
  const food = Number(body.food || 0);
  const transport = Number(body.transport || 0);
  const activities = Number(body.activities || 0);
  const misc = Number(body.misc || 0);
  const currency = typeof body.currency === "string" ? body.currency : "INR";

  if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
    return NextResponse.json({ error: "A valid totalBudget is required." }, { status: 400 });
  }

  if (!access) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  if (!canEditTrip(access)) {
    return NextResponse.json(
      { error: "You can view this budget, but only editors can change it." },
      { status: 403 }
    );
  }

  const budget = await prisma.budget.upsert({
    where: { tripId },
    update: {
      totalBudget,
      currency,
      accommodation,
      food,
      transport,
      activities,
      misc,
    },
    create: {
      tripId,
      totalBudget,
      currency,
      accommodation,
      food,
      transport,
      activities,
      misc,
    },
  });

  return NextResponse.json(budget);
}
