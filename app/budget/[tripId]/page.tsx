import { auth } from "@/auth";
import BudgetTracker from "@/components/budget-tracker";
import { prisma } from "@/lib/prisma";
import { getTripAccess } from "@/lib/trip-access";
import { BudgetBreakdown, ExpenseRecord, PersistedItinerary } from "@/lib/phase-one-types";

export default async function BudgetTrackerPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const session = await auth();
  const { tripId } = await params;

  if (!session?.user?.id) {
    return (
      <div className="landing-shell px-4 py-20 sm:px-5 lg:px-6">
        <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] px-6 py-10 text-[#61738C] shadow-[0_20px_44px_rgba(26,28,27,0.07)]">
          Please sign in.
        </div>
      </div>
    );
  }

  const access = await getTripAccess(tripId, session.user.id);

  if (!access) {
    return (
      <div className="landing-shell px-4 py-20 sm:px-5 lg:px-6">
        <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] px-6 py-10 text-[#61738C] shadow-[0_20px_44px_rgba(26,28,27,0.07)]">
          Trip not found.
        </div>
      </div>
    );
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
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
    return (
      <div className="landing-shell px-4 py-20 sm:px-5 lg:px-6">
        <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] px-6 py-10 text-[#61738C] shadow-[0_20px_44px_rgba(26,28,27,0.07)]">
          Trip not found.
        </div>
      </div>
    );
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
