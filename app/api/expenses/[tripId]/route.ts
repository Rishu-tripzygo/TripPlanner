import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
  const amount = Number(body.amount);
  const category = typeof body.category === "string" ? body.category : "MISC";
  const expenseDate =
    typeof body.expenseDate === "string" ? new Date(body.expenseDate) : new Date();
  const notes = typeof body.notes === "string" ? body.notes.trim() : undefined;

  if (!name) {
    return NextResponse.json({ error: "Expense name is required." }, { status: 400 });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "A valid amount is required." }, { status: 400 });
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

  const expense = await prisma.expense.create({
    data: {
      tripId,
      name,
      amount,
      category,
      expenseDate,
      notes,
    },
  });

  return NextResponse.json(expense);
}
