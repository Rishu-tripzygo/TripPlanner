"use client";

import {
  AITripPlannerRequest,
  AITripPlannerResponse,
  hotelCategoryOptions,
  interestOptions,
  travelStyleOptions,
  tripPurposeOptions,
} from "@/lib/ai-trip-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BedDouble,
  Bus,
  CalendarRange,
  ChefHat,
  Compass,
  LoaderCircle,
  MapPinned,
  Mountain,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";

const emptyForm: AITripPlannerRequest = {
  destination: "",
  purpose: tripPurposeOptions[0],
  days: 4,
  travelers: 2,
  budgetRange: "",
  travelStyle: travelStyleOptions[1],
  interests: ["Food", "Culture"],
  hotelCategory: hotelCategoryOptions[1],
  travelDates: "",
};

function FieldLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
      <span className="text-sky-700">{icon}</span>
      {children}
    </label>
  );
}

function TextList({
  items,
  emptyText,
}: {
  items: string[];
  emptyText?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText || "No items yet."}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm text-slate-700">
          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-sky-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AITripPlanner() {
  const [form, setForm] = useState<AITripPlannerRequest>(emptyForm);
  const [result, setResult] = useState<AITripPlannerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof AITripPlannerRequest>(
    field: K,
    value: AITripPlannerRequest[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleInterest(interest: string) {
    setForm((current) => {
      const nextInterests = current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest];

      return {
        ...current,
        interests: nextInterests,
      };
    });
  }

  function validateForm() {
    if (!form.destination.trim()) return "Destination is required.";
    if (form.days < 1 || form.days > 21) return "Days must be between 1 and 21.";
    if (form.travelers < 1 || form.travelers > 20) {
      return "Travelers must be between 1 and 20.";
    }
    if (form.interests.length === 0) return "Select at least one interest.";
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-trip-planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate itinerary.");
      }

      setResult(data);
    } catch (submissionError) {
      setResult(null);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while generating the itinerary."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_35%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_48%,_#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-sky-900 shadow-sm backdrop-blur">
              <Sparkles className="size-4" />
              Smart itinerary generator
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Plan a polished multi-day trip in seconds.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Generate a day-wise itinerary with hotel picks, food guidance,
                attraction timing, and flexible alternatives tuned to your budget
                and travel style.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-white/70 bg-white/80 shadow-lg shadow-sky-100/60 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="mb-3 inline-flex rounded-2xl bg-sky-100 p-3 text-sky-800">
                    <CalendarRange className="size-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Day-wise flow</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Morning, afternoon, and evening activities with pacing baked in.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-white/80 shadow-lg shadow-sky-100/60 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="mb-3 inline-flex rounded-2xl bg-amber-100 p-3 text-amber-800">
                    <BedDouble className="size-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Hotel guidance</p>
                  <p className="mt-2 text-sm text-slate-600">
                    3 to 5 property recommendations tailored to your trip profile.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-white/80 shadow-lg shadow-sky-100/60 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="mb-3 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                    <Compass className="size-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Practical extras</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Local foods, transport tips, hidden gems, and backup options.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-white/70 bg-white/90 shadow-2xl shadow-sky-100/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-950">
                AI Trip Planner
              </CardTitle>
              <CardDescription>
                Fill in the essentials and generate a structured premium-style itinerary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FieldLabel icon={<MapPinned className="size-4" />}>
                      Destination
                    </FieldLabel>
                    <input
                      value={form.destination}
                      onChange={(event) => updateField("destination", event.target.value)}
                      placeholder="Kyoto, Japan"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>

                  <div>
                    <FieldLabel icon={<Sparkles className="size-4" />}>
                      Trip purpose
                    </FieldLabel>
                    <select
                      value={form.purpose}
                      onChange={(event) => updateField("purpose", event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    >
                      {tripPurposeOptions.map((purpose) => (
                        <option key={purpose} value={purpose}>
                          {purpose}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <FieldLabel icon={<Users className="size-4" />}>
                      Travelers
                    </FieldLabel>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={form.travelers}
                      onChange={(event) =>
                        updateField("travelers", Number(event.target.value))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>

                  <div>
                    <FieldLabel icon={<CalendarRange className="size-4" />}>
                      Number of days
                    </FieldLabel>
                    <input
                      type="number"
                      min={1}
                      max={21}
                      value={form.days}
                      onChange={(event) => updateField("days", Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>

                  <div>
                    <FieldLabel icon={<Mountain className="size-4" />}>
                      Travel style
                    </FieldLabel>
                    <select
                      value={form.travelStyle}
                      onChange={(event) =>
                        updateField("travelStyle", event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    >
                      {travelStyleOptions.map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <FieldLabel icon={<BedDouble className="size-4" />}>
                      Hotel category
                    </FieldLabel>
                    <select
                      value={form.hotelCategory}
                      onChange={(event) =>
                        updateField("hotelCategory", event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    >
                      {hotelCategoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <FieldLabel icon={<Compass className="size-4" />}>
                      Budget range
                    </FieldLabel>
                    <input
                      value={form.budgetRange}
                      onChange={(event) => updateField("budgetRange", event.target.value)}
                      placeholder="$1500 - $2500"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>

                  <div>
                    <FieldLabel icon={<CalendarRange className="size-4" />}>
                      Travel dates
                    </FieldLabel>
                    <input
                      value={form.travelDates}
                      onChange={(event) => updateField("travelDates", event.target.value)}
                      placeholder="12 Aug - 16 Aug 2026"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel icon={<ChefHat className="size-4" />}>
                    Interests
                  </FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((interest) => {
                      const isSelected = form.interests.includes(interest);

                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm transition",
                            isSelected
                              ? "border-sky-500 bg-sky-500 text-white shadow-sm"
                              : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                          )}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-slate-950 py-6 text-base hover:bg-slate-800"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Generating itinerary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Generate AI Itinerary
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          {!result ? (
            <Card className="border-dashed border-slate-200 bg-white/70 shadow-lg shadow-sky-100/60">
              <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
                <div className="mb-5 inline-flex rounded-full bg-slate-100 p-4 text-slate-700">
                  <Sparkles className="size-8" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-950">
                  Your itinerary will appear here
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Generate a trip plan to see trip overview, hotel recommendations,
                  day-by-day flow, food ideas, and travel tips in a single structured view.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="overflow-hidden border-white/70 bg-white shadow-xl shadow-sky-100/80">
                <div className="h-2 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" />
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-950">
                    Trip Overview
                  </CardTitle>
                  <CardDescription>{result.trip_overview}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Destination
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {result.trip_summary.destination}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Trip profile
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {result.trip_summary.purpose} · {result.trip_summary.travel_style}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Duration
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {result.trip_summary.duration_days} days · {result.trip_summary.travelers} travelers
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Stay zone
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {result.trip_summary.ideal_area_to_stay}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                  <Card className="border-white/70 bg-white shadow-xl shadow-sky-100/80">
                    <CardHeader>
                      <CardTitle className="text-2xl text-slate-950">
                        Day-wise Itinerary
                      </CardTitle>
                      <CardDescription>
                        Each day includes activity flow, place suggestions, food ideas, and flexible alternatives.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.days.map((day) => (
                        <div
                          key={day.day}
                          className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
                        >
                          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
                                Day {day.day}
                              </p>
                              <h3 className="mt-1 text-xl font-semibold text-slate-950">
                                {day.title}
                              </h3>
                            </div>
                            <div className="rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
                              {day.travel_time_notes[0] || "Balanced local pacing"}
                            </div>
                          </div>

                          <div className="mt-5 grid gap-4 lg:grid-cols-3">
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                              <p className="text-sm font-semibold text-slate-900">Morning</p>
                              <div className="mt-3">
                                <TextList items={day.morning} />
                              </div>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                              <p className="text-sm font-semibold text-slate-900">Afternoon</p>
                              <div className="mt-3">
                                <TextList items={day.afternoon} />
                              </div>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                              <p className="text-sm font-semibold text-slate-900">Evening</p>
                              <div className="mt-3">
                                <TextList items={day.evening} />
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-4 lg:grid-cols-2">
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                              <p className="text-sm font-semibold text-slate-900">
                                Recommended attractions
                              </p>
                              <div className="mt-3">
                                <TextList items={day.places} />
                              </div>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                              <p className="text-sm font-semibold text-slate-900">
                                Food and recharge
                              </p>
                              <div className="mt-3">
                                <TextList items={day.food_recommendations} />
                              </div>
                              <div className="mt-4 border-t border-slate-200 pt-4">
                                <TextList
                                  items={day.relaxation_suggestions}
                                  emptyText="No relaxation suggestions for this day."
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-4 lg:grid-cols-2">
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                              <p className="text-sm font-semibold text-slate-900">
                                Travel time notes
                              </p>
                              <div className="mt-3">
                                <TextList
                                  items={day.travel_time_notes}
                                  emptyText="No major travel transfers noted."
                                />
                              </div>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                              <p className="text-sm font-semibold text-slate-900">
                                Alternative ideas
                              </p>
                              <div className="mt-3">
                                <TextList
                                  items={day.activity_alternatives}
                                  emptyText="No alternatives suggested for this day."
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-white/70 bg-white shadow-xl shadow-sky-100/80">
                    <CardHeader>
                      <CardTitle className="text-xl text-slate-950">
                        Hotel Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.hotel_recommendations.map((hotel) => (
                        <div
                          key={hotel.name}
                          className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-base font-semibold text-slate-950">
                              {hotel.name}
                            </h3>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                              {hotel.price_range}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-slate-600">
                            {hotel.description}
                          </p>
                          <p className="mt-3 text-sm font-medium text-sky-800">
                            Why this works: {hotel.recommendation_reason}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-white/70 bg-white shadow-xl shadow-sky-100/80">
                    <CardHeader>
                      <CardTitle className="text-xl text-slate-950">
                        Food Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TextList items={result.local_foods} />
                    </CardContent>
                  </Card>

                  <Card className="border-white/70 bg-white shadow-xl shadow-sky-100/80">
                    <CardHeader>
                      <CardTitle className="text-xl text-slate-950">
                        Must-Visit Attractions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TextList items={result.must_visit_attractions} />
                    </CardContent>
                  </Card>

                  <Card className="border-white/70 bg-white shadow-xl shadow-sky-100/80">
                    <CardHeader>
                      <CardTitle className="text-xl text-slate-950">
                        Hidden Gems
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TextList items={result.hidden_gems} />
                    </CardContent>
                  </Card>

                  <Card className="border-white/70 bg-white shadow-xl shadow-sky-100/80">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl text-slate-950">
                        <Bus className="size-5 text-sky-700" />
                        Transportation Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TextList items={result.transportation_suggestions} />
                    </CardContent>
                  </Card>

                  <Card className="border-white/70 bg-white shadow-xl shadow-sky-100/80">
                    <CardHeader>
                      <CardTitle className="text-xl text-slate-950">
                        Travel Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TextList items={result.travel_tips} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
