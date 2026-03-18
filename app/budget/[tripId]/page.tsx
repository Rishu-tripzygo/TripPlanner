import { auth } from "@/auth";
import BudgetTracker from "@/components/budget-tracker";
import { prisma } from "@/lib/prisma";
import { BudgetBreakdown, ExpenseRecord, PersistedItinerary } from "@/lib/phase-one-types";

export default async function BudgetTrackerPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const session = await auth();
  const { tripId } = await params;

  if (!session?.user?.id) {
    return <div className="app-shell px-4 py-20 text-white">Please sign in.</div>;
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: session.user.id,
    },
    include: {
      budget: true,
      locations: true,
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
    return <div className="app-shell px-4 py-20 text-white">Trip not found.</div>;
  }

  const budget: BudgetBreakdown | null = trip.budget
    ? {
        totalBudget: trip.budget.totalBudget,
        currency: trip.budget.currency as BudgetBreakdown["currency"],
        accommodation: trip.budget.accommodation,
        food: trip.budget.food,
        transport: trip.budget.transport,
        activities: trip.budget.activities,
        misc: trip.budget.misc,
      }
    : null;

  const expenses: ExpenseRecord[] = trip.expenses.map((expense) => ({
    id: expense.id,
    tripId: expense.tripId,
    name: expense.name,
    amount: expense.amount,
    category: expense.category,
    expenseDate: expense.expenseDate.toISOString(),
    notes: expense.notes,
  }));

  return (
    <BudgetTracker
      tripId={trip.id}
      tripTitle={trip.title}
      destinations={trip.locations.map((location) => location.locationTitle)}
      initialBudget={budget}
      initialExpenses={expenses}
      activeItinerary={
        ((trip.itineraryVersions[0]?.itineraryData as unknown as PersistedItinerary | undefined) ||
          null)
      }
    />
  );
}
