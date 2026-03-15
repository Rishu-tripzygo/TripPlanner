"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AITypingEffect from "@/components/ai-typing-effect";
import GlassWidget from "@/components/ui/glass-widget";
import SkeletonCard from "@/components/ui/skeleton-card";
import StatusBadge from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AITripPlannerRequest,
  hotelCategoryOptions,
  interestOptions,
  travelStyleOptions,
  tripPurposeOptions,
} from "@/lib/ai-trip-types";
import {
  ItineraryVersionRecord,
  PersistedItinerary,
} from "@/lib/phase-one-types";
import { cn } from "@/lib/utils";
import {
  BedDouble,
  CalendarRange,
  ChefHat,
  Copy,
  History,
  MapPinned,
  RefreshCw,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";

interface PlannerTripOption {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  destinationHint?: string | null;
}

interface AITripPlannerProps {
  trips: PlannerTripOption[];
  initialTripId?: string;
}

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

function FormLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#D8E2F1]">
      <span className="text-[#00C2FF]">{icon}</span>
      {children}
    </label>
  );
}

function OutputList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-7 text-[#D8E2F1]">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00C2FF]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function formatTripWindow(trip: PlannerTripOption) {
  return `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(
    trip.endDate
  ).toLocaleDateString()}`;
}

export default function AITripPlanner({
  trips,
  initialTripId,
}: AITripPlannerProps) {
  const [form, setForm] = useState<AITripPlannerRequest>(emptyForm);
  const [result, setResult] = useState<PersistedItinerary | null>(null);
  const [versions, setVersions] = useState<ItineraryVersionRecord[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState(
    initialTripId && trips.some((trip) => trip.id === initialTripId)
      ? initialTripId
      : trips[0]?.id || ""
  );
  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVersionsLoading, setIsVersionsLoading] = useState(false);
  const [isRestoringVersion, setIsRestoringVersion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) || null;
  const selectedVersion =
    versions.find((version) => version.id === selectedVersionId) || null;

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

      return { ...current, interests: nextInterests };
    });
  }

  function validateForm() {
    if (!selectedTripId) return "Select a trip before generating an itinerary.";
    if (!form.destination.trim()) return "Destination is required.";
    if (form.days < 1 || form.days > 21) return "Days must be between 1 and 21.";
    if (form.travelers < 1 || form.travelers > 20) {
      return "Travelers must be between 1 and 20.";
    }
    if (form.interests.length === 0) return "Select at least one interest.";
    return null;
  }

  async function loadVersions(tripId: string) {
    setIsVersionsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/itineraries?tripId=${tripId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load itinerary history.");
      }

      const nextVersions = data as ItineraryVersionRecord[];
      const activeVersion = nextVersions.find((version) => version.isActive) || nextVersions[0];

      setVersions(nextVersions);
      setSelectedVersionId(activeVersion?.id || null);
      setProviderLabel(activeVersion?.sourceProvider || null);
      setResult(activeVersion?.itineraryData || null);
    } catch (loadError) {
      setVersions([]);
      setSelectedVersionId(null);
      setProviderLabel(null);
      setResult(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load saved itinerary versions."
      );
    } finally {
      setIsVersionsLoading(false);
    }
  }

  async function submitPlanner() {
    const requestPayload: AITripPlannerRequest = {
      ...form,
      tripId: selectedTripId,
    };

    const response = await fetch("/api/ai-trip-planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || "Failed to generate itinerary.");
    }

    const saveResponse = await fetch("/api/itineraries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId: selectedTripId,
        itinerary: data,
        requestPayload,
        sourceProvider: response.headers.get("x-ai-provider") || "ai",
        title: `${form.destination} itinerary`,
      }),
    });

    const savedVersion = await saveResponse.json();
    if (!saveResponse.ok) {
      throw new Error(savedVersion.error || "Failed to save itinerary version.");
    }

    return savedVersion as ItineraryVersionRecord;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const savedVersion = await submitPlanner();
      setVersions((current) => [
        savedVersion,
        ...current
          .filter((version) => version.id !== savedVersion.id)
          .map((version) => ({ ...version, isActive: false })),
      ]);
      setSelectedVersionId(savedVersion.id);
      setProviderLabel(savedVersion.sourceProvider);
      setResult(savedVersion.itineraryData);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while generating the itinerary."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function restoreVersion(versionId: string) {
    setIsRestoringVersion(true);
    setError(null);

    try {
      const response = await fetch(`/api/itineraries/${versionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setActive: true }),
      });

      const updated = await response.json();
      if (!response.ok) {
        throw new Error(updated.error || "Failed to restore itinerary version.");
      }

      const nextVersion = updated as ItineraryVersionRecord;
      setVersions((current) =>
        current.map((version) =>
          version.id === nextVersion.id
            ? nextVersion
            : { ...version, isActive: false }
        )
      );
      setSelectedVersionId(nextVersion.id);
      setProviderLabel(nextVersion.sourceProvider);
      setResult(nextVersion.itineraryData);
    } catch (restoreError) {
      setError(
        restoreError instanceof Error
          ? restoreError.message
          : "Unable to restore that version."
      );
    } finally {
      setIsRestoringVersion(false);
    }
  }

  useEffect(() => {
    if (!selectedTripId) {
      setVersions([]);
      setSelectedVersionId(null);
      setProviderLabel(null);
      setResult(null);
      return;
    }

    const trip = trips.find((item) => item.id === selectedTripId);
    if (trip) {
      setForm((current) => ({
        ...current,
        destination: current.destination || trip.destinationHint || trip.title,
        travelDates:
          current.travelDates ||
          `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(
            trip.endDate
          ).toLocaleDateString()}`,
      }));
    }

    void loadVersions(selectedTripId);
  }, [selectedTripId, trips]);

  const actionSummary = useMemo(() => {
    if (!result) return "";
    return [
      result.trip_overview,
      ...result.days.map((day) => `Day ${day.day}: ${day.title}`),
    ].join("\n");
  }, [result]);

  return (
    <div className="app-shell px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <Card className="sticky top-24 h-fit">
          <CardHeader>
            <p className="section-label">AI Planner</p>
            <CardTitle className="text-[36px] text-white">
              Build and save a trip plan you can iterate on
            </CardTitle>
            <p className="max-w-lg text-sm leading-7 text-[#8B9BB4]">
              Generate a day-wise itinerary, save version history to a real trip, and
              keep the best draft active while we layer in streaming and refine chat next.
            </p>
          </CardHeader>
          <CardContent>
            {trips.length === 0 ? (
              <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold text-white">Create a trip first</h3>
                <p className="mt-2 text-sm leading-7 text-[#8B9BB4]">
                  Saved AI versions now attach to a specific trip. Create one trip shell,
                  then come back here to generate and manage itinerary drafts cleanly.
                </p>
                <Link href="/trips/new" className="mt-5 inline-flex">
                  <Button>Create New Trip</Button>
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <FormLabel icon={<History className="size-4" />}>Attach to trip</FormLabel>
                  <select
                    value={selectedTripId}
                    onChange={(event) => setSelectedTripId(event.target.value)}
                    className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white focus:border-[#00C2FF]/40 focus:ring-2 focus:ring-[#00C2FF]/20"
                  >
                    {trips.map((trip) => (
                      <option key={trip.id} value={trip.id} className="bg-[#0F1117]">
                        {trip.title}
                      </option>
                    ))}
                  </select>
                  {selectedTrip ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#4A5568]">
                      {formatTripWindow(selectedTrip)}
                    </p>
                  ) : null}
                </div>

                <div>
                  <FormLabel icon={<MapPinned className="size-4" />}>Destination</FormLabel>
                  <input
                    value={form.destination}
                    onChange={(event) => updateField("destination", event.target.value)}
                    placeholder="Kyoto, Japan"
                    className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-[#4A5568] focus:border-[#00C2FF]/40 focus:ring-2 focus:ring-[#00C2FF]/20"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <FormLabel icon={<Sparkles className="size-4" />}>Purpose</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {tripPurposeOptions.map((purpose) => {
                        const active = form.purpose === purpose;
                        return (
                          <button
                            key={purpose}
                            type="button"
                            onClick={() => updateField("purpose", purpose)}
                            className={cn(
                              "rounded-full border px-3 py-2 text-sm transition",
                              active
                                ? "border-[#00C2FF]/40 bg-[#00C2FF]/10 text-white"
                                : "border-white/10 bg-white/[0.03] text-[#8B9BB4] hover:text-white"
                            )}
                          >
                            {purpose}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FormLabel icon={<CalendarRange className="size-4" />}>Days</FormLabel>
                      <input
                        type="number"
                        min={1}
                        max={21}
                        value={form.days}
                        onChange={(event) => updateField("days", Number(event.target.value))}
                        className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
                      />
                    </div>
                    <div>
                      <FormLabel icon={<Users className="size-4" />}>Travelers</FormLabel>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={form.travelers}
                        onChange={(event) =>
                          updateField("travelers", Number(event.target.value))
                        }
                        className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <FormLabel icon={<Sparkles className="size-4" />}>Travel style</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {travelStyleOptions.map((style) => {
                        const active = form.travelStyle === style;
                        return (
                          <button
                            key={style}
                            type="button"
                            onClick={() => updateField("travelStyle", style)}
                            className={cn(
                              "rounded-[12px] border px-3 py-3 text-sm transition",
                              active
                                ? "border-[#00C2FF]/40 bg-[#00C2FF]/10 text-white"
                                : "border-white/10 bg-white/[0.03] text-[#8B9BB4]"
                            )}
                          >
                            {style}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <FormLabel icon={<BedDouble className="size-4" />}>Hotel</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {hotelCategoryOptions.map((category) => {
                        const active = form.hotelCategory === category;
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => updateField("hotelCategory", category)}
                            className={cn(
                              "rounded-[12px] border px-3 py-3 text-sm transition",
                              active
                                ? "border-[#00C2FF]/40 bg-[#00C2FF]/10 text-white"
                                : "border-white/10 bg-white/[0.03] text-[#8B9BB4]"
                            )}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <FormLabel icon={<ChefHat className="size-4" />}>Budget range</FormLabel>
                    <input
                      value={form.budgetRange}
                      onChange={(event) => updateField("budgetRange", event.target.value)}
                      placeholder="INR 40,000 - INR 80,000"
                      className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <FormLabel icon={<CalendarRange className="size-4" />}>Travel dates</FormLabel>
                    <input
                      value={form.travelDates}
                      onChange={(event) => updateField("travelDates", event.target.value)}
                      placeholder="12 Aug - 16 Aug 2026"
                      className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <FormLabel icon={<Sparkles className="size-4" />}>Interests</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((interest) => {
                      const active = form.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm transition",
                            active
                              ? "border-[#00C2FF]/40 bg-[#00C2FF]/10 text-white"
                              : "border-white/10 bg-white/[0.03] text-[#8B9BB4]"
                          )}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error ? (
                  <div className="rounded-[14px] border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#FFB4B4]">
                    {error}
                  </div>
                ) : null}

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? "Generating and saving..." : "Generate AI Itinerary"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <GlassWidget className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="section-label">Live Output</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {isLoading
                    ? "Thinking through your route..."
                    : "Saved itinerary and version history"}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!result}
                  onClick={() => navigator.clipboard.writeText(actionSummary)}
                  className="rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[#D8E2F1] transition disabled:opacity-40"
                >
                  <span className="inline-flex items-center gap-2">
                    <Copy className="size-4" />
                    Copy
                  </span>
                </button>
                <button
                  type="button"
                  disabled={!result}
                  onClick={() =>
                    window.alert(
                      "PDF export will fit naturally once versioned itinerary editing is in place."
                    )
                  }
                  className="rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[#D8E2F1] transition disabled:opacity-40"
                >
                  PDF
                </button>
                <button
                  type="button"
                  disabled={!result}
                  onClick={() => {
                    if (navigator.share && result) {
                      void navigator.share({
                        title: "AI Travel Planner Itinerary",
                        text: result.trip_overview,
                      });
                    }
                  }}
                  className="rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[#D8E2F1] transition disabled:opacity-40"
                >
                  <span className="inline-flex items-center gap-2">
                    <Share2 className="size-4" />
                    Share
                  </span>
                </button>
                <button
                  type="button"
                  disabled={!selectedTripId || isLoading}
                  onClick={() => {
                    if (selectedTripId) {
                      void loadVersions(selectedTripId);
                    }
                  }}
                  className="rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[#D8E2F1] disabled:opacity-40"
                >
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="size-4" />
                    Reload
                  </span>
                </button>
              </div>
            </div>
          </GlassWidget>

          {selectedTripId ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="section-label">Version History</p>
                    <CardTitle className="mt-2 text-2xl text-white">
                      {selectedTrip?.title || "Saved itinerary drafts"}
                    </CardTitle>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#8B9BB4]">
                    {versions.length} saved
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {isVersionsLoading ? (
                  <div className="space-y-3">
                    <SkeletonCard className="h-[92px]" />
                    <SkeletonCard className="h-[92px]" />
                  </div>
                ) : versions.length > 0 ? (
                  <div className="space-y-3">
                    {versions.map((version) => {
                      const previewing = version.id === selectedVersionId;
                      return (
                        <div
                          key={version.id}
                          className={cn(
                            "rounded-[18px] border p-4 transition",
                            previewing
                              ? "border-[#00C2FF]/30 bg-[#00C2FF]/8"
                              : "border-white/8 bg-white/[0.03]"
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-white">
                                Version {version.versionNumber}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#4A5568]">
                                {version.sourceProvider} ·{" "}
                                {new Date(version.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {version.isActive ? <StatusBadge status="upcoming" /> : null}
                          </div>
                          <p className="mt-3 text-sm leading-7 text-[#8B9BB4]">
                            {version.title || version.itineraryData.trip_summary.destination}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant={previewing ? "default" : "outline"}
                              className="h-9"
                              onClick={() => {
                                setSelectedVersionId(version.id);
                                setProviderLabel(version.sourceProvider);
                                setResult(version.itineraryData);
                              }}
                            >
                              Preview
                            </Button>
                            {!version.isActive ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="h-9"
                                disabled={isRestoringVersion}
                                onClick={() => void restoreVersion(version.id)}
                              >
                                {isRestoringVersion && previewing
                                  ? "Restoring..."
                                  : "Make active"}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-[#8B9BB4]">
                    No saved versions yet for this trip. Generate the first itinerary draft and
                    it will appear here automatically.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
          {isLoading ? (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/8 bg-[#0F1117] px-6 py-8">
                <p className="mb-4 text-sm uppercase tracking-[0.24em] text-[#00C2FF]">
                  Thinking...
                </p>
                <div className="flex gap-4">
                  <SkeletonCard className="flex-1" />
                  <SkeletonCard className="hidden flex-1 lg:block" />
                </div>
              </div>
              <SkeletonCard className="h-[220px]" />
              <SkeletonCard className="h-[220px]" />
            </div>
          ) : result ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="section-label">Trip Overview</p>
                      <CardTitle className="mt-2 text-3xl text-white">
                        {result.trip_summary.destination}
                      </CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedVersion?.isActive ? <StatusBadge status="upcoming" /> : null}
                      {providerLabel ? (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#8B9BB4]">
                          {providerLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AITypingEffect
                    text={result.trip_overview}
                    className="max-w-3xl text-base leading-8 text-[#D8E2F1]"
                  />
                  <div className="grid gap-4 md:grid-cols-4">
                    {[
                      [
                        "Trip profile",
                        `${result.trip_summary.purpose} · ${result.trip_summary.travel_style}`,
                      ],
                      [
                        "Duration",
                        `${result.trip_summary.duration_days} days · ${result.trip_summary.travelers} travelers`,
                      ],
                      ["Stay zone", result.trip_summary.ideal_area_to_stay],
                      ["Budget", result.trip_summary.budget_range],
                    ].map(([label, value]) => (
                      <div
                        key={label as string}
                        className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.22em] text-[#4A5568]">
                          {label}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                  {result.trip_summary.best_time_windows.length > 0 ? (
                    <div className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-[#4A5568]">
                        Best time windows
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.trip_summary.best_time_windows.map((window) => (
                          <span
                            key={window}
                            className="rounded-full border border-[#00C2FF]/20 bg-[#00C2FF]/10 px-3 py-1 text-sm text-[#D8E2F1]"
                          >
                            {window}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                <div className="space-y-6">
                  {result.days.map((day) => (
                    <Card key={day.day} className="overflow-hidden">
                      <div className="h-1 bg-[linear-gradient(135deg,#1B3A6B,#00C2FF)]" />
                      <CardContent className="space-y-5 pt-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="section-label">Day {day.day}</p>
                            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                              {day.title}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {day.destinationSeason ? (
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-[#8B9BB4]">
                                {day.destinationSeason.label} ·{" "}
                                {Math.round(day.destinationSeason.confidenceScore * 100)}%
                              </span>
                            ) : null}
                            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-[#8B9BB4]">
                              {day.travel_time_notes[0] || "Comfortable pacing"}
                            </div>
                          </div>
                        </div>

                        {day.weather ? (
                          <div className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4">
                            <p className="text-sm font-medium text-white">Weather outlook</p>
                            <p className="mt-2 text-sm leading-7 text-[#8B9BB4]">
                              {day.weather.summary} · {day.weather.temperatureMin}C to{" "}
                              {day.weather.temperatureMax}C
                            </p>
                          </div>
                        ) : null}

                        <div className="grid gap-4 lg:grid-cols-3">
                          {[
                            ["Morning", day.morning],
                            ["Afternoon", day.afternoon],
                            ["Evening", day.evening],
                          ].map(([label, items]) => (
                            <div
                              key={label as string}
                              className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4"
                            >
                              <p className="text-sm font-medium text-white">{label}</p>
                              <div className="mt-3">
                                <OutputList items={items as string[]} />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4">
                            <p className="text-sm font-medium text-white">Attractions</p>
                            <div className="mt-3">
                              <OutputList items={day.places} />
                            </div>
                          </div>
                          <div className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4">
                            <p className="text-sm font-medium text-white">Food and recharge</p>
                            <div className="mt-3">
                              <OutputList
                                items={[
                                  ...day.food_recommendations,
                                  ...day.relaxation_suggestions,
                                ]}
                              />
                            </div>
                          </div>
                        </div>

                        {day.estimatedCost ? (
                          <div className="rounded-[16px] border border-[#00C2FF]/20 bg-[#00C2FF]/8 p-4">
                            <p className="text-sm font-medium text-white">Estimated day cost</p>
                            <p className="mt-2 text-sm leading-7 text-[#D8E2F1]">
                              {day.estimatedCost.currency} {day.estimatedCost.total.toLocaleString()}
                            </p>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl text-white">
                        Hotel Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.hotel_recommendations.map((hotel) => (
                        <div
                          key={hotel.name}
                          className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-white">{hotel.name}</h3>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#8B9BB4]">
                              {hotel.price_range}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-7 text-[#8B9BB4]">
                            {hotel.description}
                          </p>
                          <p className="mt-3 text-sm text-[#D8E2F1]">
                            {hotel.recommendation_reason}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {[
                    ["Local Foods", result.local_foods],
                    ["Must-Visit Attractions", result.must_visit_attractions],
                    ["Hidden Gems", result.hidden_gems],
                    ["Transportation Suggestions", result.transportation_suggestions],
                    ["Travel Tips", result.travel_tips],
                  ].map(([title, items]) => (
                    <Card key={title as string}>
                      <CardHeader>
                        <CardTitle className="text-xl text-white">{title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <OutputList items={items as string[]} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card className="min-h-[620px]">
              <CardContent className="flex h-full flex-col items-center justify-center py-20 text-center">
                <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] p-4 text-[#00C2FF]">
                  <Sparkles className="size-7" />
                </div>
                <h2 className="text-3xl font-semibold text-white">
                  Your saved itinerary will appear here
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#8B9BB4]">
                  Generate a trip draft to create the first saved version, then preview and
                  restore itinerary history from this panel.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
