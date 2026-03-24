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
  RefinementMessage,
} from "@/lib/phase-one-types";
import { cn } from "@/lib/utils";
import {
  BedDouble,
  CalendarRange,
  ChefHat,
  Copy,
  History,
  MapPinned,
  MessageSquareText,
  RefreshCw,
  Send,
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

type StreamEvent =
  | { type: "status"; stage: string; message: string }
  | { type: "overview_chunk"; text: string }
  | { type: "complete"; version: ItineraryVersionRecord }
  | { type: "error"; error: string };

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
    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#3E536F]">
      <span className="text-[#024785]">{icon}</span>
      {children}
    </label>
  );
}

function OutputList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-7 text-[#3E536F]">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#024785]" />
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
  const [messages, setMessages] = useState<RefinementMessage[]>([]);
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
  const [isRefining, setIsRefining] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [streamingOverview, setStreamingOverview] = useState("");
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

  async function loadMessages(tripId: string) {
    try {
      const response = await fetch(`/api/chat-messages?tripId=${tripId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load AI conversation.");
      }

      setMessages(data as RefinementMessage[]);
    } catch {
      setMessages([]);
    }
  }

  async function submitPlanner() {
    const requestPayload: AITripPlannerRequest = {
      ...form,
      tripId: selectedTripId,
    };

    const response = await fetch("/api/ai-trip-planner/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.details || data.error || "Failed to generate itinerary.");
    }

    if (!response.body) {
      throw new Error("Streaming response body was not available.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let completedVersion: ItineraryVersionRecord | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line) as StreamEvent;

        if (event.type === "status") {
          setStreamStatus(event.message);
        } else if (event.type === "overview_chunk") {
          setStreamingOverview((current) => current + event.text);
        } else if (event.type === "complete") {
          completedVersion = event.version;
        } else if (event.type === "error") {
          throw new Error(event.error);
        }
      }
    }

    if (!completedVersion) {
      throw new Error("Streaming completed without a saved itinerary version.");
    }

    return completedVersion;
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
    setStreamStatus("Preparing your trip brief");
    setStreamingOverview("");

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
      setStreamStatus(null);
      setStreamingOverview("");
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

  async function handleRefineSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedVersionId) {
      setError("Choose an itinerary version before refining it.");
      return;
    }

    const instruction = refinePrompt.trim();
    if (!instruction) {
      setError("Enter a refinement request first.");
      return;
    }

    setIsRefining(true);
    setError(null);

    const optimisticUserMessage: RefinementMessage = {
      id: `temp-${Date.now()}`,
      role: "USER",
      content: instruction,
      createdAt: new Date().toISOString(),
      itineraryVersionId: selectedVersionId,
    };

    setMessages((current) => [...current, optimisticUserMessage]);

    try {
      const response = await fetch(`/api/itineraries/${selectedVersionId}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to refine itinerary.");
      }

      const nextVersion = data.version as ItineraryVersionRecord;
      const assistantMessage = data.assistantMessage as RefinementMessage;

      setVersions((current) => [
        nextVersion,
        ...current
          .filter((version) => version.id !== nextVersion.id)
          .map((version) => ({ ...version, isActive: false })),
      ]);
      setSelectedVersionId(nextVersion.id);
      setProviderLabel(nextVersion.sourceProvider);
      setResult(nextVersion.itineraryData);
      setMessages((current) => [
        ...current.filter((message) => message.id !== optimisticUserMessage.id),
        {
          ...optimisticUserMessage,
          id: `user-${nextVersion.id}`,
          itineraryVersionId: selectedVersionId,
        },
        assistantMessage,
      ]);
      setRefinePrompt("");
    } catch (refineError) {
      setMessages((current) =>
        current.filter((message) => message.id !== optimisticUserMessage.id)
      );
      setError(
        refineError instanceof Error
          ? refineError.message
          : "Unable to refine that itinerary right now."
      );
    } finally {
      setIsRefining(false);
    }
  }

  useEffect(() => {
    if (!selectedTripId) {
      setVersions([]);
      setMessages([]);
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
    void loadMessages(selectedTripId);
  }, [selectedTripId, trips]);

  const actionSummary = useMemo(() => {
    if (!result) return "";
    return [
      result.trip_overview,
      ...result.days.map((day) => `Day ${day.day}: ${day.title}`),
    ].join("\n");
  }, [result]);

  const plannerSteps = [
    {
      label: "Brief",
      title: "Shape the trip brief",
      description: "Choose the right trip shell, destination, pace, and guest profile.",
    },
    {
      label: "Draft",
      title: "Generate a structured route",
      description: "Create a full saved itinerary with hotels, food cues, and day cards.",
    },
    {
      label: "Refine",
      title: "Iterate without losing history",
      description: "Preview older drafts, restore a favorite, or ask AI for precise changes.",
    },
  ];

  return (
    <div className="app-shell space-y-8">
      <section className="relative overflow-hidden rounded-[36px] border border-[rgba(2,71,133,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,247,251,0.92))] p-6 shadow-[0_28px_70px_rgba(26,28,27,0.08)] sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[42%] bg-[radial-gradient(circle_at_top,rgba(0,194,255,0.16),transparent_50%),radial-gradient(circle_at_bottom,rgba(2,71,133,0.12),transparent_46%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
          <div className="space-y-6">
            <p className="section-label">AI Trip Planner</p>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-[family-name:var(--font-noto-serif)] text-[44px] leading-[0.95] tracking-[-0.05em] text-[#024785] sm:text-[58px] xl:text-[72px]">
                Plan the route beautifully, then keep refining it like a real travel workspace.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[#5C6F89]">
                Wandrly turns one destination brief into a saved itinerary version with daily pacing,
                hotel recommendations, food suggestions, and version history your trip can grow from.
              </p>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {plannerSteps.map((step) => (
                <div
                  key={step.label}
                  className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-white/88 p-5 shadow-[0_14px_28px_rgba(26,28,27,0.05)] backdrop-blur-sm"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-[#4A5568]">
                    {step.label}
                  </p>
                  <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[28px] leading-[1.02] tracking-[-0.04em] text-[#1A1C1B]">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#61738C]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 rounded-[28px] border border-[rgba(2,71,133,0.08)] bg-white/84 p-5 shadow-[0_18px_40px_rgba(26,28,27,0.07)] backdrop-blur-sm sm:grid-cols-3 xl:grid-cols-1">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#4A5568]">Saved versions</p>
              <p className="mt-3 font-[family-name:var(--font-noto-serif)] text-[42px] leading-none tracking-[-0.05em] text-[#024785]">
                {versions.length}
              </p>
              <p className="mt-2 text-sm text-[#61738C]">
                Each generated draft stays recoverable instead of being overwritten.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#4A5568]">Active trip</p>
              <p className="mt-3 text-lg font-semibold text-[#1A1C1B]">
                {selectedTrip?.title || "Choose a trip"}
              </p>
              <p className="mt-2 text-sm text-[#61738C]">
                {selectedTrip ? formatTripWindow(selectedTrip) : "Attach the planner to a trip shell first."}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#4A5568]">Current state</p>
              <p className="mt-3 text-lg font-semibold text-[#1A1C1B]">
                {isLoading ? "Generating..." : result ? "Ready to refine" : "Waiting for brief"}
              </p>
              <p className="mt-2 text-sm text-[#61738C]">
                {isLoading
                  ? streamStatus || "The planner is shaping your route."
                  : result
                    ? "Preview the active itinerary, compare versions, and refine with AI."
                    : "Complete the form to create your first saved itinerary."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <Card className="h-fit border-[rgba(2,71,133,0.08)] bg-white/96 xl:sticky xl:top-24">
          <CardHeader>
            <p className="section-label">Trip Brief</p>
            <CardTitle className="font-[family-name:var(--font-noto-serif)] text-[34px] leading-[0.98] text-[#024785]">
              Give the planner the right context
            </CardTitle>
            <p className="max-w-lg text-sm leading-7 text-[#61738C]">
              The better the brief is here, the more useful the saved itinerary becomes across
              budget, weather, packing, and trip prep later.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {trips.length === 0 ? (
              <div className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#F6F4EF] p-6">
                <h3 className="font-[family-name:var(--font-noto-serif)] text-[32px] font-bold tracking-[-0.03em] text-[#024785]">
                  Create a trip first
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#61738C]">
                  Saved AI versions attach to real trips. Create a trip shell first, then come
                  back here to generate and manage itinerary drafts cleanly.
                </p>
                <Link href="/trips/new" className="mt-5 inline-flex">
                  <Button>Create New Trip</Button>
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
                  <FormLabel icon={<History className="size-4" />}>Attach to trip</FormLabel>
                  <select
                    value={selectedTripId}
                    onChange={(event) => setSelectedTripId(event.target.value)}
                    className="w-full rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-white px-4 py-3 text-sm text-[#1A1C1B] focus:border-[#024785]/30 focus:ring-2 focus:ring-[#024785]/10"
                  >
                    {trips.map((trip) => (
                      <option key={trip.id} value={trip.id} className="bg-white text-[#1A1C1B]">
                        {trip.title}
                      </option>
                    ))}
                  </select>
                  {selectedTrip ? (
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#4A5568]">
                      {formatTripWindow(selectedTrip)}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
                  <FormLabel icon={<MapPinned className="size-4" />}>Destination</FormLabel>
                  <input
                    value={form.destination}
                    onChange={(event) => updateField("destination", event.target.value)}
                    placeholder="Kyoto, Japan"
                    className="w-full rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-white px-4 py-3 text-sm text-[#1A1C1B] placeholder:text-[#8A96A8] focus:border-[#024785]/30 focus:ring-2 focus:ring-[#024785]/10"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
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
                                ? "border-[#024785]/20 bg-[#EEF2F8] text-[#024785]"
                                : "border-[rgba(2,71,133,0.08)] bg-white text-[#61738C] hover:text-[#024785]"
                            )}
                          >
                            {purpose}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4 sm:grid-cols-2">
                    <div>
                      <FormLabel icon={<CalendarRange className="size-4" />}>Days</FormLabel>
                      <input
                        type="number"
                        min={1}
                        max={21}
                        value={form.days}
                        onChange={(event) => updateField("days", Number(event.target.value))}
                        className="w-full rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-white px-4 py-3 text-sm text-[#1A1C1B]"
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
                        className="w-full rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-white px-4 py-3 text-sm text-[#1A1C1B]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
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
                              "rounded-[14px] border px-3 py-3 text-sm transition",
                              active
                                ? "border-[#024785]/20 bg-[#EEF2F8] text-[#024785]"
                                : "border-[rgba(2,71,133,0.08)] bg-white text-[#61738C]"
                            )}
                          >
                            {style}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
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
                              "rounded-[14px] border px-3 py-3 text-sm transition",
                              active
                                ? "border-[#024785]/20 bg-[#EEF2F8] text-[#024785]"
                                : "border-[rgba(2,71,133,0.08)] bg-white text-[#61738C]"
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
                  <div className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
                    <FormLabel icon={<ChefHat className="size-4" />}>Budget range</FormLabel>
                    <input
                      value={form.budgetRange}
                      onChange={(event) => updateField("budgetRange", event.target.value)}
                      placeholder="INR 40,000 - INR 80,000"
                      className="w-full rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-white px-4 py-3 text-sm text-[#1A1C1B]"
                    />
                  </div>
                  <div className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
                    <FormLabel icon={<CalendarRange className="size-4" />}>Travel dates</FormLabel>
                    <input
                      value={form.travelDates}
                      onChange={(event) => updateField("travelDates", event.target.value)}
                      placeholder="12 Aug - 16 Aug 2026"
                      className="w-full rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-white px-4 py-3 text-sm text-[#1A1C1B]"
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
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
                              ? "border-[#024785]/20 bg-[#EEF2F8] text-[#024785]"
                              : "border-[rgba(2,71,133,0.08)] bg-white text-[#61738C]"
                          )}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error ? (
                  <div className="rounded-[18px] border border-[#EF4444]/25 bg-[#FFF2F2] px-4 py-3 text-sm text-[#B42318]">
                    {error}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  className="h-14 w-full rounded-full text-base"
                  disabled={isLoading}
                >
                  {isLoading ? "Generating and saving..." : "Generate AI Itinerary"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <GlassWidget className="rounded-[28px] border border-[rgba(2,71,133,0.08)] bg-white/80 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="section-label">Live Output</p>
                <h2 className="mt-2 font-[family-name:var(--font-noto-serif)] text-[34px] font-bold tracking-[-0.03em] text-[#024785]">
                  {isLoading ? "Thinking through your route..." : "Saved itinerary workspace"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[#61738C]">
                  {isLoading
                    ? streamStatus || "The planner is shaping your route, pace, and hotel logic."
                    : "Review the active itinerary, compare saved versions, and keep refining the plan without losing history."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!result}
                  onClick={() => navigator.clipboard.writeText(actionSummary)}
                  className="rounded-full border border-[rgba(2,71,133,0.08)] bg-white px-4 py-2.5 text-sm text-[#3E536F] transition hover:border-[#024785]/15 disabled:opacity-40"
                >
                  <span className="inline-flex items-center gap-2">
                    <Copy className="size-4" />
                    Copy brief
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
                  className="rounded-full border border-[rgba(2,71,133,0.08)] bg-white px-4 py-2.5 text-sm text-[#3E536F] transition hover:border-[#024785]/15 disabled:opacity-40"
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
                  className="rounded-full border border-[rgba(2,71,133,0.08)] bg-white px-4 py-2.5 text-sm text-[#3E536F] transition hover:border-[#024785]/15 disabled:opacity-40"
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
                  className="rounded-full border border-[rgba(2,71,133,0.08)] bg-white px-4 py-2.5 text-sm text-[#3E536F] transition hover:border-[#024785]/15 disabled:opacity-40"
                >
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="size-4" />
                    Refresh
                  </span>
                </button>
              </div>
            </div>
          </GlassWidget>
          {selectedTripId ? (
            <Card className="border-[rgba(2,71,133,0.08)] bg-white/96">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="section-label">Version History</p>
                    <CardTitle className="mt-2 font-[family-name:var(--font-noto-serif)] text-[34px] leading-[0.98] text-[#024785]">
                      {selectedTrip?.title || "Saved itinerary drafts"}
                    </CardTitle>
                  </div>
                  <span className="rounded-full border border-[rgba(2,71,133,0.08)] bg-[#F4F3F1] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#61738C]">
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
                              ? "border-[#024785]/18 bg-[#EEF2F8]"
                              : "border-[rgba(2,71,133,0.08)] bg-[#FAF9F7]"
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-[#1A1C1B]">
                                Version {version.versionNumber}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#4A5568]">
                                {version.sourceProvider} / {new Date(version.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {version.isActive ? <StatusBadge status="upcoming" /> : null}
                          </div>
                          <p className="mt-3 text-sm leading-7 text-[#61738C]">
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
                                {isRestoringVersion && previewing ? "Restoring..." : "Make active"}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-5 text-sm leading-7 text-[#61738C]">
                    No saved versions yet for this trip. Generate the first itinerary draft and
                    it will appear here automatically.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {isLoading ? (
            <div className="space-y-4">
              <div className="rounded-[28px] border border-[rgba(2,71,133,0.08)] bg-[#F6F4EF] px-6 py-8">
                <p className="mb-4 text-sm uppercase tracking-[0.24em] text-[#00C2FF]">
                  Live generation
                </p>
                <div className="rounded-[22px] border border-[rgba(2,71,133,0.08)] bg-white p-5">
                  <p className="text-sm font-medium text-[#1A1C1B]">
                    {streamStatus || "Generating your itinerary"}
                  </p>
                  <div className="mt-4 min-h-[108px] rounded-[18px] bg-[#FAF9F7] p-4">
                    {streamingOverview ? (
                      <p className="text-sm leading-7 text-[#3E536F]">
                        {streamingOverview}
                        <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-[#024785]" />
                      </p>
                    ) : (
                      <p className="text-sm leading-7 text-[#61738C]">
                        Thinking through pace, neighborhoods, hotels, and daily flow...
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <SkeletonCard className="h-[180px]" />
                  <SkeletonCard className="h-[180px]" />
                </div>
              </div>
              <SkeletonCard className="h-[220px]" />
              <SkeletonCard className="h-[220px]" />
            </div>
          ) : result ? (
            <div className="space-y-6">
              <Card className="overflow-hidden border-[rgba(2,71,133,0.08)] bg-white/96">
                <div className="h-1 bg-[linear-gradient(135deg,#024785,#3b79b6)]" />
                <CardHeader>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="section-label">Trip Overview</p>
                      <CardTitle className="mt-2 text-3xl text-[#024785]">
                        {result.trip_summary.destination}
                      </CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedVersion?.isActive ? <StatusBadge status="upcoming" /> : null}
                      {providerLabel ? (
                        <span className="rounded-full border border-[rgba(2,71,133,0.08)] bg-[#F4F3F1] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#61738C]">
                          {providerLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AITypingEffect
                    text={result.trip_overview}
                    className="max-w-3xl text-base leading-8 text-[#3E536F]"
                  />
                  <div className="grid gap-4 md:grid-cols-4">
                    {[
                      [
                        "Trip profile",
                        `${result.trip_summary.purpose} / ${result.trip_summary.travel_style}`,
                      ],
                      [
                        "Duration",
                        `${result.trip_summary.duration_days} days / ${result.trip_summary.travelers} travelers`,
                      ],
                      ["Stay zone", result.trip_summary.ideal_area_to_stay],
                      ["Budget", result.trip_summary.budget_range],
                    ].map(([label, value]) => (
                      <div
                        key={label as string}
                        className="rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.22em] text-[#4A5568]">
                          {label}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#1A1C1B]">{value}</p>
                      </div>
                    ))}
                  </div>
                  {result.trip_summary.best_time_windows.length > 0 ? (
                    <div className="rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-[#4A5568]">
                        Best time windows
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.trip_summary.best_time_windows.map((window) => (
                          <span
                            key={window}
                            className="rounded-full border border-[#024785]/12 bg-[#EEF2F8] px-3 py-1 text-sm text-[#024785]"
                          >
                            {window}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                <div className="space-y-6">
                  {result.days.map((day) => (
                    <Card key={day.day} className="overflow-hidden border-[rgba(2,71,133,0.08)] bg-white/96">
                      <div className="h-1 bg-[linear-gradient(135deg,#1B3A6B,#00C2FF)]" />
                      <CardContent className="space-y-5 pt-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="section-label">Day {day.day}</p>
                            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#024785]">
                              {day.title}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {day.destinationSeason ? (
                              <span className="rounded-full border border-[rgba(2,71,133,0.08)] bg-[#F4F3F1] px-4 py-2 text-sm text-[#61738C]">
                                {day.destinationSeason.label} / {Math.round(day.destinationSeason.confidenceScore * 100)}%
                              </span>
                            ) : null}
                            <div className="rounded-full border border-[rgba(2,71,133,0.08)] bg-[#F4F3F1] px-4 py-2 text-sm text-[#61738C]">
                              {day.travel_time_notes[0] || "Comfortable pacing"}
                            </div>
                          </div>
                        </div>

                        {day.weather ? (
                          <div className="rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
                            <p className="text-sm font-medium text-[#1A1C1B]">Weather outlook</p>
                            <p className="mt-2 text-sm leading-7 text-[#61738C]">
                              {day.weather.summary} / {day.weather.temperatureMin}C to {day.weather.temperatureMax}C
                            </p>
                          </div>
                        ) : null}

                        <div className="rounded-[20px] border border-[rgba(2,71,133,0.08)] bg-[#F8F6F2] p-4 sm:p-5">
                          <div className="flex flex-col gap-3 border-b border-[rgba(2,71,133,0.08)] pb-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.22em] text-[#4A5568]">
                                Daily Schedule
                              </p>
                              <p className="mt-2 text-sm leading-7 text-[#61738C]">
                                A cleaner day flow with enough room for real activity detail.
                              </p>
                            </div>
                            <div className="rounded-full border border-[rgba(2,71,133,0.08)] bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#61738C]">
                              {day.morning.length + day.afternoon.length + day.evening.length} moments
                            </div>
                          </div>

                          <div className="mt-5 space-y-4">
                            {[
                              ["Morning", day.morning, "08:00 - 12:00"],
                              ["Afternoon", day.afternoon, "12:00 - 17:00"],
                              ["Evening", day.evening, "17:00 onward"],
                            ].map(([label, items, window]) => (
                              <div
                                key={label as string}
                                className="grid gap-4 rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-white p-4 md:grid-cols-[180px_1fr]"
                              >
                                <div className="border-b border-[rgba(2,71,133,0.08)] pb-3 md:border-b-0 md:border-r md:pb-0 md:pr-4">
                                  <p className="text-xs uppercase tracking-[0.24em] text-[#4A5568]">
                                    {label}
                                  </p>
                                  <p className="mt-2 font-[family-name:var(--font-noto-serif)] text-[28px] leading-none tracking-[-0.04em] text-[#024785]">
                                    {Array.isArray(items) ? items.length : 0}
                                  </p>
                                  <p className="mt-2 text-sm text-[#61738C]">{window as string}</p>
                                </div>

                                <div className="space-y-3">
                                  {(items as string[]).length > 0 ? (
                                    (items as string[]).map((item) => (
                                      <div
                                        key={`${label as string}-${item}`}
                                        className="rounded-[14px] bg-[#FAF9F7] px-4 py-3 text-sm leading-7 text-[#3E536F]"
                                      >
                                        <div className="flex gap-3">
                                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#024785]" />
                                          <span>{item}</span>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="rounded-[14px] bg-[#FAF9F7] px-4 py-3 text-sm leading-7 text-[#61738C]">
                                      No activities planned yet for this part of the day.
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-2">
                          <div className="rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
                            <p className="text-sm font-medium text-[#1A1C1B]">Attractions</p>
                            <div className="mt-3">
                              <OutputList items={day.places} />
                            </div>
                          </div>
                          <div className="rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
                            <p className="text-sm font-medium text-[#1A1C1B]">Food and recharge</p>
                            <div className="mt-3">
                              <OutputList
                                items={[...day.food_recommendations, ...day.relaxation_suggestions]}
                              />
                            </div>
                          </div>
                        </div>

                        {day.estimatedCost ? (
                          <div className="rounded-[18px] border border-[#00C2FF]/20 bg-[#00C2FF]/8 p-4">
                            <p className="text-sm font-medium text-[#024785]">Estimated day cost</p>
                            <p className="mt-2 text-sm leading-7 text-[#3E536F]">
                              {day.estimatedCost.currency} {day.estimatedCost.total.toLocaleString()}
                            </p>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-6">
                  <Card className="border-[rgba(2,71,133,0.08)] bg-white/96">
                    <CardHeader>
                      <CardTitle className="text-2xl text-[#024785]">
                        Hotel Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.hotel_recommendations.map((hotel) => (
                        <div
                          key={hotel.name}
                          className="rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-[#1A1C1B]">{hotel.name}</h3>
                            <span className="rounded-full border border-[rgba(2,71,133,0.08)] bg-white px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#61738C]">
                              {hotel.price_range}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-7 text-[#61738C]">
                            {hotel.description}
                          </p>
                          <p className="mt-3 text-sm text-[#3E536F]">
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
                    <Card key={title as string} className="border-[rgba(2,71,133,0.08)] bg-white/96">
                      <CardHeader>
                        <CardTitle className="text-xl text-[#024785]">{title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <OutputList items={items as string[]} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="border-[rgba(2,71,133,0.08)] bg-white/96">
                <CardHeader>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="section-label">Refine With AI</p>
                      <CardTitle className="mt-2 flex items-center gap-2 text-2xl text-[#024785]">
                        <MessageSquareText className="size-5 text-[#00C2FF]" />
                        Adjust the plan in natural language
                      </CardTitle>
                    </div>
                    {selectedVersion ? (
                      <span className="rounded-full border border-[rgba(2,71,133,0.08)] bg-[#F4F3F1] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#61738C]">
                        Based on v{selectedVersion.versionNumber}
                      </span>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      "Make day 2 more budget-friendly",
                      "Add a beach sunset plan on day 3",
                      "Replace nightlife with family-friendly options",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setRefinePrompt(suggestion)}
                        className="rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4 text-left text-sm leading-7 text-[#3E536F] transition hover:border-[#00C2FF]/20 hover:bg-[#EEF7FD]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 rounded-[20px] border border-[rgba(2,71,133,0.08)] bg-[#FAF9F7] p-4">
                    {messages.length > 0 ? (
                      <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                        {messages.map((message) => {
                          const isUser = message.role === "USER";
                          return (
                            <div
                              key={message.id}
                              className={cn(
                                "rounded-[18px] border p-4",
                                isUser
                                  ? "ml-auto max-w-[88%] border-[#00C2FF]/20 bg-[#00C2FF]/10"
                                  : "mr-auto max-w-[92%] border-[rgba(2,71,133,0.08)] bg-white"
                              )}
                            >
                              <p className="text-xs uppercase tracking-[0.2em] text-[#4A5568]">
                                {isUser ? "You" : "AI Planner"}
                              </p>
                              <p className="mt-2 text-sm leading-7 text-[#3E536F]">
                                {message.content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-[18px] border border-dashed border-[rgba(2,71,133,0.12)] bg-white p-4 text-sm leading-7 text-[#61738C]">
                        No refinement history yet. Ask for a focused change like slowing one day
                        down, making the route cheaper, or swapping activities.
                      </div>
                    )}

                    <form className="space-y-3" onSubmit={handleRefineSubmit}>
                      <textarea
                        value={refinePrompt}
                        onChange={(event) => setRefinePrompt(event.target.value)}
                        placeholder="Try: make day 2 slower-paced and add one vegetarian dinner option."
                        className="min-h-[120px] w-full rounded-[18px] border border-[rgba(2,71,133,0.08)] bg-white px-4 py-3 text-sm leading-7 text-[#1A1C1B] placeholder:text-[#8A96A8] focus:border-[#00C2FF]/40 focus:ring-2 focus:ring-[#00C2FF]/20"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-[#61738C]">
                          Each refinement creates a new saved itinerary version.
                        </p>
                        <Button
                          type="submit"
                          disabled={isRefining || !selectedVersionId}
                          className="min-w-[190px]"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Send className="size-4" />
                            {isRefining ? "Refining..." : "Apply refinement"}
                          </span>
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="min-h-[620px] border-[rgba(2,71,133,0.08)] bg-white/96">
              <CardContent className="flex h-full flex-col items-center justify-center py-20 text-center">
                <div className="mb-5 inline-flex rounded-full border border-[rgba(2,71,133,0.08)] bg-[#EEF7FD] p-4 text-[#00C2FF]">
                  <Sparkles className="size-7" />
                </div>
                <h2 className="text-3xl font-semibold text-[#024785]">
                  Your saved itinerary will appear here
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#61738C]">
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
