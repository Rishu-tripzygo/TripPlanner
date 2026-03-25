"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CurrencyConverterWidget from "@/components/currency-converter-widget";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { BudgetBreakdown, ExpenseRecord, PersistedItinerary } from "@/lib/phase-one-types";
import { Landmark, Receipt, Wallet } from "lucide-react";

interface BudgetTrackerProps {
  tripId: string;
  tripTitle: string;
  destinations: string[];
  initialBudget: BudgetBreakdown | null;
  initialExpenses: ExpenseRecord[];
  activeItinerary: PersistedItinerary | null;
}

const categories = [
  { key: "accommodation", label: "Accommodation" },
  { key: "food", label: "Food" },
  { key: "transport", label: "Transport" },
  { key: "activities", label: "Activities" },
  { key: "misc", label: "Misc" },
] as const;

function DonutChart({
  values,
  total,
}: {
  values: Array<{ label: string; value: number; color: string }>;
  total: number;
}) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg viewBox="0 0 180 180" className="h-[180px] w-[180px]">
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="18"
      />
      {values.map((item) => {
        const dash = total > 0 ? (item.value / total) * circumference : 0;
        const circle = (
          <circle
            key={item.label}
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={item.color}
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 90 90)"
          />
        );
        offset += dash;
        return circle;
      })}
      <text x="90" y="84" textAnchor="middle" className="fill-[#8B9BB4] text-[11px] uppercase">
        Planned
      </text>
      <text x="90" y="104" textAnchor="middle" className="fill-white text-[18px] font-semibold">
        {total.toLocaleString()}
      </text>
    </svg>
  );
}

export default function BudgetTracker({
  tripId,
  tripTitle,
  destinations,
  initialBudget,
  initialExpenses,
  activeItinerary,
}: BudgetTrackerProps) {
  const [budget, setBudget] = useState<BudgetBreakdown>(
    initialBudget || {
      totalBudget: activeItinerary?.total_estimated_cost?.total || 0,
      currency: activeItinerary?.total_estimated_cost?.currency || "INR",
      accommodation: activeItinerary?.total_estimated_cost?.accommodation || 0,
      food: activeItinerary?.total_estimated_cost?.food || 0,
      transport: activeItinerary?.total_estimated_cost?.transport || 0,
      activities: activeItinerary?.total_estimated_cost?.activities || 0,
      misc: activeItinerary?.total_estimated_cost?.misc || 0,
    }
  );
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initialExpenses);
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expenseDraft, setExpenseDraft] = useState({
    name: "",
    amount: "",
    category: "MISC",
    expenseDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const spentTotal = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses]
  );
  const remainingBudget = budget.totalBudget - spentTotal;
  const donutValues = [
    { label: "Accommodation", value: budget.accommodation, color: "#00C2FF" },
    { label: "Food", value: budget.food, color: "#1B3A6B" },
    { label: "Transport", value: budget.transport, color: "#22C55E" },
    { label: "Activities", value: budget.activities, color: "#F59E0B" },
    { label: "Misc", value: budget.misc, color: "#FF6B35" },
  ];

  async function saveBudget() {
    setIsSavingBudget(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/budget/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budget),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save budget.");
      }

      setBudget({
        totalBudget: data.totalBudget,
        currency: data.currency,
        accommodation: data.accommodation,
        food: data.food,
        transport: data.transport,
        activities: data.activities,
        misc: data.misc,
      });
      setSuccessMessage("Budget saved. Your trip targets are up to date.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save budget.");
    } finally {
      setIsSavingBudget(false);
    }
  }

  async function addExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingExpense(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/expenses/${tripId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseDraft),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to log expense.");
      }

      setExpenses((current) => [
        {
          ...data,
          expenseDate: new Date(data.expenseDate).toISOString(),
        },
        ...current,
      ]);
      setExpenseDraft({
        name: "",
        amount: "",
        category: "MISC",
        expenseDate: new Date().toISOString().slice(0, 10),
        notes: "",
      });
      setSuccessMessage("Expense logged. Your running total has been updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to log expense.");
    } finally {
      setIsSavingExpense(false);
    }
  }

  return (
    <div className="app-shell space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <p className="section-label">Budget Tracker</p>
            <CardTitle className="text-[40px] text-white">{tripTitle}</CardTitle>
            <p className="text-sm leading-7 text-[#8B9BB4]">
              Plan your target budget, compare it against real expenses, and use the active AI
              itinerary as a baseline for daily cost expectations.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-[#D8E2F1]">Total budget</span>
              <input
                value={budget.totalBudget}
                onChange={(event) =>
                  setBudget((current) => ({
                    ...current,
                    totalBudget: Number(event.target.value || 0),
                  }))
                }
                type="number"
                className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-[#D8E2F1]">Currency</span>
              <select
                value={budget.currency}
                onChange={(event) =>
                  setBudget((current) => ({
                    ...current,
                    currency: event.target.value as BudgetBreakdown["currency"],
                  }))
                }
                className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency} className="bg-[#0F1117]">
                    {currency}
                  </option>
                ))}
              </select>
            </label>
            {categories.map((category) => (
              <label key={category.key} className="space-y-2">
                <span className="text-sm text-[#D8E2F1]">{category.label}</span>
                <input
                  value={budget[category.key]}
                  onChange={(event) =>
                    setBudget((current) => ({
                      ...current,
                      [category.key]: Number(event.target.value || 0),
                    }))
                  }
                  type="number"
                  className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
                />
              </label>
            ))}

            <div className="md:col-span-2 flex items-center justify-between gap-4">
              {error ? (
                <p className="text-sm text-[#FFB4B4]">{error}</p>
              ) : successMessage ? (
                <p className="text-sm text-[#9FE7FF]">{successMessage}</p>
              ) : (
                <p className="text-sm text-[#8B9BB4]">
                  {activeItinerary?.total_estimated_cost
                    ? `AI estimate: ${activeItinerary.total_estimated_cost.currency} ${activeItinerary.total_estimated_cost.total.toLocaleString()}`
                    : "Set your budget targets for this trip."}
                </p>
              )}
              <Button onClick={saveBudget} disabled={isSavingBudget}>
                {isSavingBudget ? "Saving..." : "Save Budget"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                <Wallet className="size-5" />
              </div>
              <div>
                <p className="section-label">Health</p>
                <CardTitle className="text-2xl text-white">Running total vs budget</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Planned", `${budget.currency} ${budget.totalBudget.toLocaleString()}`],
                ["Spent", `${budget.currency} ${spentTotal.toLocaleString()}`],
                ["Remaining", `${budget.currency} ${remainingBudget.toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#4A5568]">{label}</p>
                  <p
                    className={`mt-3 text-lg font-semibold ${
                      label === "Remaining" && remainingBudget < 0
                        ? "text-[#FFB4B4]"
                        : "text-white"
                    }`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
              <DonutChart values={donutValues} total={Math.max(1, budget.totalBudget)} />
              <div className="w-full space-y-3">
                {donutValues.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-[#D8E2F1]">
                      <span>{item.label}</span>
                      <span>
                        {budget.currency} {item.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.04]">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${budget.totalBudget > 0 ? (item.value / budget.totalBudget) * 100 : 0}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <CurrencyConverterWidget
        destinations={destinations}
        defaultFrom={budget.currency}
        suggestedAmount={budget.totalBudget || activeItinerary?.total_estimated_cost?.total || 10000}
        title="Budget in local currency"
        compact
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                <Landmark className="size-5" />
              </div>
              <div>
                <p className="section-label">Expense Logger</p>
                <CardTitle className="text-2xl text-white">Add actual trip spend</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={addExpense}>
              <input
                value={expenseDraft.name}
                onChange={(event) =>
                  setExpenseDraft((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Airport taxi"
                className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={expenseDraft.amount}
                  onChange={(event) =>
                    setExpenseDraft((current) => ({ ...current, amount: event.target.value }))
                  }
                  type="number"
                  placeholder="1200"
                  className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
                />
                <select
                  value={expenseDraft.category}
                  onChange={(event) =>
                    setExpenseDraft((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
                >
                  {["ACCOMMODATION", "FOOD", "TRANSPORT", "ACTIVITIES", "MISC"].map(
                    (category) => (
                      <option key={category} value={category} className="bg-[#0F1117]">
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>
              <input
                value={expenseDraft.expenseDate}
                onChange={(event) =>
                  setExpenseDraft((current) => ({
                    ...current,
                    expenseDate: event.target.value,
                  }))
                }
                type="date"
                className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
              />
              <textarea
                value={expenseDraft.notes}
                onChange={(event) =>
                  setExpenseDraft((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Optional notes"
                className="min-h-[110px] w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
              />
              <Button type="submit" className="w-full" disabled={isSavingExpense}>
                {isSavingExpense ? "Saving expense..." : "Log Expense"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                <Receipt className="size-5" />
              </div>
              <div>
                <p className="section-label">Ledger</p>
                <CardTitle className="text-2xl text-white">Expense timeline</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex flex-col gap-2 rounded-[16px] border border-white/8 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{expense.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#4A5568]">
                      {expense.category} · {new Date(expense.expenseDate).toLocaleDateString()}
                    </p>
                    {expense.notes ? (
                      <p className="mt-2 text-sm leading-7 text-[#8B9BB4]">{expense.notes}</p>
                    ) : null}
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {budget.currency} {expense.amount.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-[#8B9BB4]">
                No real expenses logged yet. Start with flights, transfers, meals, or stays once
                spending begins so Wandrly can compare your plan against actual trip cost.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
