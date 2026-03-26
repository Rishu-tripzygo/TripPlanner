"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import type { TripRouteStatus } from "@/lib/trip-route-state";
import { cn } from "@/lib/utils";
import {
  BedDouble,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  Clock3,
  Compass,
  MapPinned,
  MessageSquareText,
  Sparkles,
  Star,
  SunMedium,
  Users,
  WalletCards,
} from "lucide-react";

interface PlannerTripOption {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  destinationHint?: string | null;
  routeStatus?: TripRouteStatus | null;
  confirmedStopsCount?: number;
}

interface CompletedTripPayload {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  wasAutoCreated: boolean;
  routeStatus: TripRouteStatus;
  confirmedStopsCount: number;
}

interface AITripPlannerProps {
  trips: PlannerTripOption[];
  initialTripId?: string;
  initialDraft?: Partial<AITripPlannerRequest>;
}

type StreamEvent =
  | { type: "request"; requestId: string }
  | { type: "status"; stage: string; message: string }
  | { type: "overview_chunk"; text: string }
  | { type: "complete"; version: ItineraryVersionRecord; trip: CompletedTripPayload }
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

function formatTripWindow(trip: PlannerTripOption) {
  return `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(
    trip.endDate
  ).toLocaleDateString()}`;
}

function getRouteStatusTone(routeStatus?: TripRouteStatus | null) {
  switch (routeStatus) {
    case "CONFIRMED":
      return "text-[#0f7a54]";
    case "STALE":
      return "text-[#b26a15]";
    case "SUGGESTED":
      return "text-[#14518b]";
    default:
      return "text-[#61738C]";
  }
}

function getRouteStatusLabel(routeStatus?: TripRouteStatus | null) {
  switch (routeStatus) {
    case "CONFIRMED":
      return "Route confirmed";
    case "STALE":
      return "Route needs refresh";
    case "SUGGESTED":
      return "Route suggestions ready";
    default:
      return "Route not started";
  }
}

function getNextWorkspaceStep(
  trip: CompletedTripPayload | PlannerTripOption | null,
  wasAutoCreated?: boolean
) {
  if (!trip) return null;
  const stateEyebrow =
    typeof wasAutoCreated === "boolean"
      ? wasAutoCreated
        ? "Trip created"
        : "Itinerary updated"
      : "Current trip";

  if (trip.routeStatus === "SUGGESTED") {
    return {
      eyebrow: stateEyebrow,
      title: "Review and confirm the AI route next",
      description:
        "Your itinerary is saved, but the route is still in suggestion mode. Open the workspace to review stops, adjust them if needed, and confirm the route on the map.",
      label: "Review Route in Workspace",
    };
  }

  if (trip.routeStatus === "STALE") {
    return {
      eyebrow: "Route out of sync",
      title: "Refresh the confirmed route before you keep planning",
      description:
        "This new itinerary version changed the suggested stops. Open the workspace to review the updated route, refresh it, and keep the map aligned with the latest plan.",
      label: "Refresh Route in Workspace",
    };
  }

  if (trip.routeStatus === "CONFIRMED") {
    return {
      eyebrow: stateEyebrow,
      title: "Your route is already confirmed. Move into prep.",
      description:
        "The itinerary is saved and the route is still confirmed. Open the workspace to continue with budget, documents, packing, and final trip prep.",
      label: "Continue in Workspace",
    };
  }

  return {
    eyebrow: stateEyebrow,
    title: "Open the workspace to keep shaping this trip",
    description:
      "Your itinerary is saved. Open the workspace to review route suggestions, add context, and move the trip into the next planning step.",
    label: "Open Workspace",
  };
}

function destinationImage(destination?: string) {
  const query = encodeURIComponent(destination || "luxury travel destination");
  return `https://source.unsplash.com/1600x900/?${query}`;
}

function StepBadge({ step, title }: { step: string; title: string }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/45 bg-white/46 px-4 py-2 text-sm text-[#56728f] backdrop-blur-xl">
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#14518b] text-xs font-semibold text-white">
        {step}
      </span>
      <span>{title}</span>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#14518b]">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[2.3rem] font-bold leading-[0.95] tracking-[-0.05em] text-[#0f3460] sm:text-[3rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-sm leading-8 text-[#61738C] sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function DetailPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/45 bg-white/54 px-4 py-2 text-sm text-[#46617c] backdrop-blur-xl">
      <span className="font-medium text-[#0f3460]">{value}</span>
      <span className="ml-2 text-[#7a8ea8]">{label}</span>
    </div>
  );
}

function OutputList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-7 text-[#46617c]">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14518b]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TimelineBlock({
  label,
  icon,
  window,
  items,
}: {
  label: string;
  icon: React.ReactNode;
  window: string;
  items: string[];
}) {
  return (
    <div className="rounded-[22px] border border-white/45 bg-white/48 p-4 shadow-[0_12px_28px_rgba(20,81,139,0.05)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#eef4fb] text-[#14518b]">
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0f3460]">{label}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-[#7a8ea8]">{window}</p>
          </div>
        </div>
        <div className="rounded-full border border-white/45 bg-white/58 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#6c819a]">
          {items.length} items
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={`${label}-${item}`} className="rounded-[16px] bg-[#f8f5ef] px-4 py-3 text-sm leading-7 text-[#46617c]">
              {item}
            </div>
          ))
        ) : (
          <div className="rounded-[16px] bg-[#f8f5ef] px-4 py-3 text-sm leading-7 text-[#7a8ea8]">
            No activities planned yet for this part of the day.
          </div>
        )}
      </div>
    </div>
  );
}

export default function AITripPlanner({
  trips,
  initialTripId,
  initialDraft,
}: AITripPlannerProps) {
  const [tripOptions, setTripOptions] = useState<PlannerTripOption[]>(trips);
  const [plannerMode, setPlannerMode] = useState<"autocreate" | "existing">(
    initialTripId && trips.some((trip) => trip.id === initialTripId) ? "existing" : "autocreate"
  );
  const [selectedTripId, setSelectedTripId] = useState(
    initialTripId && trips.some((trip) => trip.id === initialTripId) ? initialTripId : ""
  );
  const [form, setForm] = useState<AITripPlannerRequest>({
    ...emptyForm,
    ...initialDraft,
  });
  const [result, setResult] = useState<PersistedItinerary | null>(null);
  const [versions, setVersions] = useState<ItineraryVersionRecord[]>([]);
  const [messages, setMessages] = useState<RefinementMessage[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const [lastSavedTrip, setLastSavedTrip] = useState<CompletedTripPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVersionsLoading, setIsVersionsLoading] = useState(false);
  const [isRestoringVersion, setIsRestoringVersion] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [streamingOverview, setStreamingOverview] = useState("");
  const [generationRequestId, setGenerationRequestId] = useState<string | null>(null);
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

      return { ...current, interests: nextInterests };
    });
  }

  function validateForm() {
    if (plannerMode === "existing" && !selectedTripId) {
      return "Select an existing trip or switch to auto-create mode.";
    }
    if (!form.destination.trim()) return "Destination is required.";
    if (form.days < 1 || form.days > 21) return "Days must be between 1 and 21.";
    if (form.travelers < 1 || form.travelers > 20) {
      return "Travelers must be between 1 and 20.";
    }
    if (form.interests.length === 0) return "Select at least one interest.";
    return null;
  }

  function handleStartNewBrief() {
    setPlannerMode("autocreate");
    setSelectedTripId("");
    setForm({ ...emptyForm });
    setResult(null);
    setVersions([]);
    setMessages([]);
    setSelectedVersionId(null);
    setProviderLabel(null);
    setLastSavedTrip(null);
    setHistoryOpen(false);
    setRefineOpen(false);
    setRefinePrompt("");
    setStreamStatus(null);
    setStreamingOverview("");
    setGenerationRequestId(null);
    setError(null);
    setAdvancedOpen(false);
  }

  function syncTripRouteState(
    tripId: string,
    routeState: {
      routeStatus: TripRouteStatus;
      confirmedStopsCount: number;
    }
  ) {
    setTripOptions((current) =>
      current.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              routeStatus: routeState.routeStatus,
              confirmedStopsCount: routeState.confirmedStopsCount,
            }
          : trip
      )
    );

    setLastSavedTrip((current) =>
      current && current.id === tripId
        ? {
            ...current,
            routeStatus: routeState.routeStatus,
            confirmedStopsCount: routeState.confirmedStopsCount,
          }
        : current
    );
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
      tripId: plannerMode === "existing" ? selectedTripId : undefined,
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
    let completedTrip: CompletedTripPayload | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line) as StreamEvent;

        if (event.type === "request") {
          setGenerationRequestId(event.requestId);
        } else if (event.type === "status") {
          setStreamStatus(event.message);
        } else if (event.type === "overview_chunk") {
          setStreamingOverview((current) => current + event.text);
        } else if (event.type === "complete") {
          completedVersion = event.version;
          completedTrip = event.trip;
        } else if (event.type === "error") {
          throw new Error(event.error);
        }
      }
    }

    if (!completedVersion || !completedTrip) {
      throw new Error("Streaming completed without a saved itinerary version.");
    }

    return { version: completedVersion, trip: completedTrip };
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
    setStreamStatus("Designing your itinerary...");
    setStreamingOverview("");
    setGenerationRequestId(null);

    try {
      const { version: savedVersion, trip } = await submitPlanner();
      setLastSavedTrip(trip);
      setPlannerMode("existing");
      setSelectedTripId(trip.id);
      setTripOptions((current) => {
        const existing = current.find((item) => item.id === trip.id);
        if (existing) {
          return current.map((item) =>
            item.id === trip.id
              ? {
                  ...item,
                  id: trip.id,
                  title: trip.title,
                  startDate: trip.startDate,
                  endDate: trip.endDate,
                  destinationHint: form.destination,
                  routeStatus: trip.routeStatus,
                  confirmedStopsCount: trip.confirmedStopsCount,
                }
              : item
          );
        }
        return [
          {
            id: trip.id,
            title: trip.title,
            startDate: trip.startDate,
            endDate: trip.endDate,
            destinationHint: form.destination,
            routeStatus: trip.routeStatus,
            confirmedStopsCount: trip.confirmedStopsCount,
          },
          ...current,
        ];
      });

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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to restore itinerary version.");
      }

      const nextVersion = data.version as ItineraryVersionRecord;
      setVersions((current) =>
        current.map((version) =>
          version.id === nextVersion.id ? nextVersion : { ...version, isActive: false }
        )
      );
      setSelectedVersionId(nextVersion.id);
      setProviderLabel(nextVersion.sourceProvider);
      setResult(nextVersion.itineraryData);
      if (data.trip) {
        syncTripRouteState(nextVersion.tripId, {
          routeStatus: data.trip.routeStatus as TripRouteStatus,
          confirmedStopsCount: data.trip.confirmedStopsCount as number,
        });
      }
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
      if (data.trip) {
        syncTripRouteState(nextVersion.tripId, {
          routeStatus: data.trip.routeStatus as TripRouteStatus,
          confirmedStopsCount: data.trip.confirmedStopsCount as number,
        });
      }
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
    setTripOptions(trips);
  }, [trips]);

  useEffect(() => {
    if (!initialDraft) return;
    setForm((current) => ({
      ...current,
      ...Object.fromEntries(
        Object.entries(initialDraft).filter(([, value]) => value !== undefined && value !== "")
      ),
    }));
  }, [initialDraft]);

  useEffect(() => {
    if (plannerMode !== "existing" || !selectedTripId) {
      setVersions([]);
      setMessages([]);
      setSelectedVersionId(null);
      setProviderLabel(null);
      if (plannerMode !== "existing") {
        setResult(null);
        setLastSavedTrip(null);
      }
      return;
    }

    const trip = tripOptions.find((item) => item.id === selectedTripId);
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
  }, [plannerMode, selectedTripId, tripOptions]);

  const selectedTrip = tripOptions.find((trip) => trip.id === selectedTripId) || null;
  const actionSummary = useMemo(() => {
    if (!result) return "";
    return [result.trip_overview, ...result.days.map((day) => `Day ${day.day}: ${day.title}`)].join(
      "\n"
    );
  }, [result]);

  const headerDestination = result?.trip_summary.destination || form.destination || "Your next trip";
  const dayHighlight =
    result?.hidden_gems?.[0] ||
    result?.must_visit_attractions?.[0] ||
    "A signature local moment selected for this route.";
  const activeTripForResult = lastSavedTrip || selectedTrip;
  const nextWorkspaceStep = useMemo(() => {
    if (!activeTripForResult) return null;
    return {
      ...getNextWorkspaceStep(activeTripForResult, lastSavedTrip?.wasAutoCreated),
      href: `/trips/${activeTripForResult.id}`,
    };
  }, [activeTripForResult, lastSavedTrip?.wasAutoCreated]);
  const tripSaveLabel = lastSavedTrip
    ? lastSavedTrip.wasAutoCreated
      ? "Trip created"
      : "Trip updated"
    : "Active itinerary loaded";

  return (
    <div className="app-shell space-y-8">
      {/* step 1 */}
      {!result && !isLoading ? (
        <section className="space-y-8">
          <div className="mx-auto max-w-4xl text-center">
            <StepBadge step="01" title="Trip input" />
            <SectionTitle
              eyebrow="AI Trip Planner"
              title="Tell Wandrly where you want to go, and we'll shape the first great version."
              description="A cleaner brief creates a better trip. Start with the essentials, then open advanced preferences only if you want more control."
            />
          </div>

          <Card className="glass-shell mx-auto max-w-4xl overflow-hidden rounded-[34px] border-white/45 bg-[rgba(255,255,255,0.6)]">
            <CardContent className="space-y-8 p-6 sm:p-8 lg:p-10">
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPlannerMode("autocreate")}
                  className={cn(
                    "rounded-[24px] border p-5 text-left transition",
                    plannerMode === "autocreate"
                      ? "border-[#14518b]/20 bg-[#eef4fb]"
                      : "border-white/45 bg-white/44 hover:bg-white/58"
                  )}
                >
                  <p className="text-sm font-semibold text-[#0f3460]">Create trip from this plan</p>
                  <p className="mt-2 text-sm leading-7 text-[#61738C]">
                    Perfect for a fresh idea. Wandrly creates the trip and saves the itinerary automatically.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setPlannerMode("existing")}
                  className={cn(
                    "rounded-[24px] border p-5 text-left transition",
                    plannerMode === "existing"
                      ? "border-[#14518b]/20 bg-[#eef4fb]"
                      : "border-white/45 bg-white/44 hover:bg-white/58"
                  )}
                >
                  <p className="text-sm font-semibold text-[#0f3460]">Use an existing trip</p>
                  <p className="mt-2 text-sm leading-7 text-[#61738C]">
                    Attach this AI itinerary to a trip you already created and keep the same workspace.
                  </p>
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {plannerMode === "existing" ? (
                  <div className="rounded-[26px] border border-white/45 bg-white/44 p-5 backdrop-blur-xl">
                    <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#46617c]">
                      <Compass className="size-4 text-[#14518b]" />
                      Select trip
                    </label>
                    {tripOptions.length > 0 ? (
                      <>
                        <select
                          value={selectedTripId}
                          onChange={(event) => setSelectedTripId(event.target.value)}
                          className="w-full rounded-[18px] border border-white/55 bg-white/80 px-4 py-4 text-base text-[#1A1C1B] focus:border-[#14518b]/30 focus:ring-2 focus:ring-[#14518b]/10"
                        >
                          <option value="">Choose a trip</option>
                          {tripOptions.map((trip) => (
                            <option key={trip.id} value={trip.id}>
                              {trip.title}
                            </option>
                          ))}
                        </select>
                        {selectedTrip ? (
                          <p className="mt-3 text-sm text-[#61738C]">{formatTripWindow(selectedTrip)}</p>
                        ) : null}
                      </>
                    ) : (
                      <div className="rounded-[18px] border border-white/45 bg-white/58 px-4 py-4 text-sm leading-7 text-[#61738C]">
                        No trips exist yet. Switch back to auto-create mode and let Wandrly save the trip for you.
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-[26px] border border-white/45 bg-white/44 p-5 backdrop-blur-xl md:col-span-2">
                    <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#46617c]">
                      <MapPinned className="size-4 text-[#14518b]" />
                      Destination
                    </label>
                    <input
                      value={form.destination}
                      onChange={(event) => updateField("destination", event.target.value)}
                      placeholder="Tokyo and Hakone"
                      className="w-full rounded-[18px] border border-white/55 bg-white/80 px-4 py-4 text-base text-[#1A1C1B] placeholder:text-[#8A96A8] focus:border-[#14518b]/30 focus:ring-2 focus:ring-[#14518b]/10"
                    />
                  </div>

                  <div className="rounded-[26px] border border-white/45 bg-white/44 p-5 backdrop-blur-xl">
                    <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#46617c]">
                      <CalendarRange className="size-4 text-[#14518b]" />
                      Dates
                    </label>
                    <input
                      value={form.travelDates}
                      onChange={(event) => updateField("travelDates", event.target.value)}
                      placeholder="12 Aug - 18 Aug 2026"
                      className="w-full rounded-[18px] border border-white/55 bg-white/80 px-4 py-4 text-base text-[#1A1C1B] placeholder:text-[#8A96A8] focus:border-[#14518b]/30 focus:ring-2 focus:ring-[#14518b]/10"
                    />
                  </div>

                  <div className="rounded-[26px] border border-white/45 bg-white/44 p-5 backdrop-blur-xl">
                    <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#46617c]">
                      <Users className="size-4 text-[#14518b]" />
                      Travelers
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={form.travelers}
                      onChange={(event) => updateField("travelers", Number(event.target.value))}
                      className="w-full rounded-[18px] border border-white/55 bg-white/80 px-4 py-4 text-base text-[#1A1C1B] focus:border-[#14518b]/30 focus:ring-2 focus:ring-[#14518b]/10"
                    />
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/45 bg-white/44 p-5 backdrop-blur-xl">
                  <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#46617c]">
                    <Sparkles className="size-4 text-[#14518b]" />
                    Travel style
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {travelStyleOptions.map((style) => {
                      const active = form.travelStyle === style;
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => updateField("travelStyle", style)}
                          className={cn(
                            "rounded-full border px-5 py-3 text-sm transition",
                            active
                              ? "border-[#14518b]/18 bg-[#eef4fb] text-[#14518b]"
                              : "border-white/55 bg-white/72 text-[#61738C] hover:text-[#14518b]"
                          )}
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/45 bg-white/44 p-5 backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => setAdvancedOpen((value) => !value)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="text-base font-semibold text-[#0f3460]">Advanced preferences</p>
                      <p className="mt-1 text-sm text-[#61738C]">
                        Budget, purpose, hotel category, and interests
                      </p>
                    </div>
                    {advancedOpen ? (
                      <ChevronDown className="size-5 text-[#14518b]" />
                    ) : (
                      <ChevronRight className="size-5 text-[#14518b]" />
                    )}
                  </button>

                  {advancedOpen ? (
                    <div className="mt-5 space-y-5 border-t border-white/45 pt-5">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#46617c]">
                            <Sparkles className="size-4 text-[#14518b]" />
                            Purpose
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {tripPurposeOptions.map((purpose) => {
                              const active = form.purpose === purpose;
                              return (
                                <button
                                  key={purpose}
                                  type="button"
                                  onClick={() => updateField("purpose", purpose)}
                                  className={cn(
                                    "rounded-full border px-4 py-2 text-sm transition",
                                    active
                                      ? "border-[#14518b]/18 bg-[#eef4fb] text-[#14518b]"
                                      : "border-white/55 bg-white/72 text-[#61738C]"
                                  )}
                                >
                                  {purpose}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#46617c]">
                            <BedDouble className="size-4 text-[#14518b]" />
                            Hotel category
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {hotelCategoryOptions.map((category) => {
                              const active = form.hotelCategory === category;
                              return (
                                <button
                                  key={category}
                                  type="button"
                                  onClick={() => updateField("hotelCategory", category)}
                                  className={cn(
                                    "rounded-[16px] border px-4 py-3 text-sm transition",
                                    active
                                      ? "border-[#14518b]/18 bg-[#eef4fb] text-[#14518b]"
                                      : "border-white/55 bg-white/72 text-[#61738C]"
                                  )}
                                >
                                  {category}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#46617c]">
                            <WalletCards className="size-4 text-[#14518b]" />
                            Budget range
                          </label>
                          <input
                            value={form.budgetRange}
                            onChange={(event) => updateField("budgetRange", event.target.value)}
                            placeholder="INR 80,000 - INR 140,000"
                            className="w-full rounded-[18px] border border-white/55 bg-white/80 px-4 py-4 text-base text-[#1A1C1B] placeholder:text-[#8A96A8]"
                          />
                        </div>

                        <div>
                          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#46617c]">
                            <Clock3 className="size-4 text-[#14518b]" />
                            Days
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={21}
                            value={form.days}
                            onChange={(event) => updateField("days", Number(event.target.value))}
                            className="w-full rounded-[18px] border border-white/55 bg-white/80 px-4 py-4 text-base text-[#1A1C1B]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#46617c]">
                          <Star className="size-4 text-[#14518b]" />
                          Interests
                        </label>
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
                                    ? "border-[#14518b]/18 bg-[#eef4fb] text-[#14518b]"
                                    : "border-white/55 bg-white/72 text-[#61738C]"
                                )}
                              >
                                {interest}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {error ? (
                  <div className="rounded-[18px] border border-[#EF4444]/25 bg-[#FFF2F2] px-4 py-3 text-sm text-[#B42318]">
                    {error}
                  </div>
                ) : null}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-7 text-[#61738C]">
                    {plannerMode === "autocreate"
                      ? "Your trip will be created automatically as soon as the itinerary is ready."
                      : "The new itinerary version will be saved into the selected trip."}
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 w-full rounded-full px-8 text-base sm:w-auto"
                    disabled={isLoading}
                  >
                    Generate My Trip
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      ) : null}
      {/* step 2 */}
      {isLoading ? (
        <section className="space-y-8">
          <div className="mx-auto max-w-4xl text-center">
            <StepBadge step="02" title="AI generation" />
            <SectionTitle
              eyebrow="Designing your itinerary"
              title={streamStatus || "Finding the best route, stays, and experiences for your trip."}
              description="Wandrly is building a structured itinerary, balancing pace, destination highlights, hotel logic, and travel practicality."
            />
            {generationRequestId ? (
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#7a8ea8]">
                Request logged: {generationRequestId}
              </p>
            ) : null}
          </div>

          <div className="glass-shell overflow-hidden rounded-[34px] p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <div className="h-6 w-40 animate-pulse rounded-full bg-white/55" />
                <div className="h-16 w-full animate-pulse rounded-[24px] bg-white/55" />
                <div className="h-16 w-[84%] animate-pulse rounded-[24px] bg-white/48" />
                <div className="rounded-[28px] border border-white/45 bg-white/38 p-5 backdrop-blur-xl">
                  <p className="text-sm leading-8 text-[#61738C]">
                    {streamingOverview || "Designing your itinerary... finding best routes, stays, and experiences..."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="rounded-[26px] border border-white/45 bg-white/42 p-5 backdrop-blur-xl">
                    <div className="h-5 w-28 animate-pulse rounded-full bg-white/55" />
                    <div className="mt-4 h-5 w-2/3 animate-pulse rounded-full bg-white/48" />
                    <div className="mt-4 space-y-3">
                      <div className="h-14 animate-pulse rounded-[18px] bg-white/48" />
                      <div className="h-14 animate-pulse rounded-[18px] bg-white/42" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
      {/* step 3 */}
      {result ? (
        <section className="space-y-8">
          <div className="rounded-[36px] border border-white/45 bg-white/60 shadow-[0_30px_70px_rgba(20,81,139,0.1)] backdrop-blur-[24px]">
            <div
              className="relative overflow-hidden rounded-t-[36px] px-6 py-8 sm:px-8 sm:py-10"
              style={{
                backgroundImage: `linear-gradient(180deg,rgba(15,52,96,0.16),rgba(15,52,96,0.58)),url('${destinationImage(
                  headerDestination
                )}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,194,255,0.2),transparent_32%)]" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl text-white">
                  <StepBadge step="03" title="Trip reveal" />
                  <h1 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[3rem] font-bold leading-[0.92] tracking-[-0.06em] sm:text-[4.3rem]">
                    {headerDestination}
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-8 text-white/84 sm:text-base">
                    {result.trip_overview}
                  </p>
                  <div className="scroll-row mt-6 sm:flex sm:flex-wrap sm:overflow-visible sm:pb-0">
                    <DetailPill label="days" value={`${result.trip_summary.duration_days}`} />
                    <DetailPill label="travelers" value={`${result.trip_summary.travelers}`} />
                    <DetailPill label="budget" value={result.trip_summary.budget_range} />
                    <DetailPill label="style" value={result.trip_summary.travel_style} />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  {nextWorkspaceStep ? (
                    <Link href={nextWorkspaceStep.href}>
                      <Button className="w-full rounded-full px-7 py-6 text-base sm:w-auto">
                        {nextWorkspaceStep.label}
                      </Button>
                    </Link>
                  ) : null}
                  <Button
                    variant="outline"
                    onClick={() => setRefineOpen(true)}
                    className="w-full rounded-full border-white/35 bg-white/15 px-7 py-6 text-base text-white backdrop-blur-xl hover:bg-white/22 sm:w-auto"
                  >
                    Refine with AI
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleStartNewBrief}
                    className="w-full rounded-full border-white/35 bg-white/10 px-7 py-6 text-base text-white backdrop-blur-xl hover:bg-white/18 sm:w-auto"
                  >
                    Start a new brief
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-white/45 bg-white/46 px-6 py-5 sm:px-8">
              <div className="scroll-row items-center sm:flex sm:flex-wrap sm:items-center sm:overflow-visible sm:pb-0">
                <div className="rounded-full border border-white/45 bg-white/62 px-4 py-2 text-sm text-[#14518b]">
                  Saved to {(lastSavedTrip || selectedTrip)?.title || "trip"}
                </div>
                <div className="rounded-full border border-white/45 bg-white/62 px-4 py-2 text-sm text-[#61738C]">
                  {tripSaveLabel}
                </div>
                <div
                  className={cn(
                    "rounded-full border border-white/45 bg-white/62 px-4 py-2 text-sm",
                    getRouteStatusTone(activeTripForResult?.routeStatus)
                  )}
                >
                  {getRouteStatusLabel(activeTripForResult?.routeStatus)}
                </div>
                {typeof activeTripForResult?.confirmedStopsCount === "number" ? (
                  <div className="rounded-full border border-white/45 bg-white/62 px-4 py-2 text-sm text-[#61738C]">
                    {activeTripForResult.confirmedStopsCount} confirmed
                    {activeTripForResult.confirmedStopsCount === 1 ? " stop" : " stops"}
                  </div>
                ) : null}
                {providerLabel ? (
                  <div className="rounded-full border border-white/45 bg-white/62 px-4 py-2 text-sm text-[#61738C]">
                    {providerLabel}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => setHistoryOpen((value) => !value)}
                  className="rounded-full border border-white/45 bg-white/62 px-4 py-2 text-sm text-[#61738C]"
                >
                  {historyOpen ? "Hide version history" : "View version history"}
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(actionSummary)}
                  className="rounded-full border border-white/45 bg-white/62 px-4 py-2 text-sm text-[#61738C]"
                >
                  Copy summary
                </button>
              </div>
            </div>
          </div>

          {nextWorkspaceStep ? (
            <Card className="glass-shell overflow-hidden rounded-[30px] border-white/45 bg-white/58">
              <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl">
                  <p className="section-label text-[#14518b]">
                    {nextWorkspaceStep.eyebrow}
                  </p>
                  <h2 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[2rem] leading-[0.98] tracking-[-0.04em] text-[#024785]">
                    {nextWorkspaceStep.title}
                  </h2>
                  <p className="mt-3 text-sm leading-8 text-[#61738C]">
                    {nextWorkspaceStep.description}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Link href={nextWorkspaceStep.href}>
                    <Button className="w-full rounded-full px-6 sm:w-auto">
                      {nextWorkspaceStep.label}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full rounded-full px-6 sm:w-auto"
                    onClick={() => setRefineOpen(true)}
                  >
                    Refine with AI
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full rounded-full px-6 text-[#14518b] sm:w-auto"
                    onClick={handleStartNewBrief}
                  >
                    Start a new brief
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {historyOpen ? (
            <Card className="glass-shell overflow-hidden rounded-[32px] border-white/45 bg-white/56">
              <CardContent className="space-y-4 p-6">
                <SectionTitle
                  eyebrow="Version history"
                  title="Saved itinerary drafts"
                  description="Version history stays out of the way until you need it. Preview older drafts or restore one as the active itinerary."
                />

                {isVersionsLoading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="h-28 animate-pulse rounded-[24px] bg-white/50" />
                    <div className="h-28 animate-pulse rounded-[24px] bg-white/50" />
                  </div>
                ) : versions.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {versions.map((version) => {
                      const previewing = version.id === selectedVersionId;
                      return (
                        <div
                          key={version.id}
                          className={cn(
                            "rounded-[24px] border p-5",
                            previewing
                              ? "border-[#14518b]/18 bg-[#eef4fb]"
                              : "border-white/45 bg-white/48"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#0f3460]">
                                Version {version.versionNumber}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#7a8ea8]">
                                {new Date(version.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {version.isActive ? (
                              <span className="rounded-full bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#14518b]">
                                Active
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-3 text-sm leading-7 text-[#61738C]">
                            {version.title || version.itineraryData.trip_summary.destination}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant={previewing ? "default" : "outline"}
                              className="h-9 rounded-full"
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
                                className="h-9 rounded-full"
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
                  <div className="rounded-[22px] border border-white/45 bg-white/48 p-5 text-sm leading-7 text-[#61738C]">
                    No saved versions yet beyond the active itinerary.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              {result.days.map((day) => (
                <Card key={day.day} className="glass-shell overflow-hidden rounded-[30px] border-white/45 bg-white/56">
                  <CardContent className="space-y-5 p-6 sm:p-7">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#14518b]">
                          Day {day.day}
                        </p>
                        <h3 className="mt-2 font-[family-name:var(--font-noto-serif)] text-[2rem] font-bold tracking-[-0.04em] text-[#0f3460]">
                          {day.title}
                        </h3>
                      </div>

                      <div className="scroll-row sm:flex sm:flex-wrap sm:overflow-visible sm:pb-0">
                        {day.weather ? (
                          <div className="rounded-full border border-white/45 bg-white/60 px-4 py-2 text-sm text-[#61738C]">
                            {day.weather.summary} - {day.weather.temperatureMin}C to {day.weather.temperatureMax}C
                          </div>
                        ) : null}
                        {day.estimatedCost ? (
                          <div className="rounded-full border border-white/45 bg-[#eef4fb] px-4 py-2 text-sm text-[#14518b]">
                            {day.estimatedCost.currency} {day.estimatedCost.total.toLocaleString()}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <TimelineBlock label="Morning" icon={<SunMedium className="size-4" />} window="08:00 - 12:00" items={day.morning} />
                      <TimelineBlock label="Afternoon" icon={<Compass className="size-4" />} window="12:00 - 17:00" items={day.afternoon} />
                      <TimelineBlock label="Evening" icon={<Star className="size-4" />} window="17:00 onward" items={day.evening} />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <details className="rounded-[22px] border border-white/45 bg-white/48 p-5 lg:pointer-events-none" open>
                        <summary className="cursor-pointer list-none text-sm font-semibold text-[#0f3460]">
                          Attractions
                        </summary>
                        <div className="mt-3">
                          <OutputList items={day.places} />
                        </div>
                      </details>
                      <details className="rounded-[22px] border border-white/45 bg-white/48 p-5 lg:pointer-events-none" open>
                        <summary className="cursor-pointer list-none text-sm font-semibold text-[#0f3460]">
                          Food and recharge
                        </summary>
                        <div className="mt-3">
                          <OutputList items={[...day.food_recommendations, ...day.relaxation_suggestions]} />
                        </div>
                      </details>
                    </div>

                    <div className="rounded-[22px] border border-white/45 bg-[linear-gradient(135deg,rgba(20,81,139,0.08),rgba(0,194,255,0.08))] p-5">
                      <p className="text-sm font-semibold text-[#0f3460]">Highlight</p>
                      <p className="mt-2 text-sm leading-7 text-[#46617c]">
                        {day.activity_alternatives[0] || day.travel_time_notes[0] || dayHighlight}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
              <Card className="glass-shell rounded-[30px] border-white/45 bg-white/56">
                <CardContent className="space-y-5 p-6">
                  <SectionTitle
                    eyebrow="Stay beautifully"
                    title="Hotel recommendations"
                    description="Curated stays matched to your trip style, budget, and the area that makes the route smoother."
                  />
                  <div className="space-y-4">
                    {result.hotel_recommendations.map((hotel) => (
                      <div key={hotel.name} className="rounded-[22px] border border-white/45 bg-white/50 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold text-[#0f3460]">{hotel.name}</h3>
                          <span className="rounded-full bg-[#eef4fb] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#14518b]">
                            {hotel.price_range}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[#61738C]">{hotel.description}</p>
                        <p className="mt-3 text-sm leading-7 text-[#46617c]">{hotel.recommendation_reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <details className="rounded-[30px] border border-white/45 bg-white/56 p-6 backdrop-blur-[24px] xl:hidden">
                <summary className="cursor-pointer text-lg font-semibold text-[#0f3460]">
                  Attractions, foods, and tips
                </summary>
                <div className="mt-5 space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-[#0f3460]">Key attractions</p>
                    <div className="mt-3"><OutputList items={result.must_visit_attractions} /></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f3460]">Local foods</p>
                    <div className="mt-3"><OutputList items={result.local_foods} /></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f3460]">Travel tips</p>
                    <div className="mt-3"><OutputList items={result.travel_tips} /></div>
                  </div>
                </div>
              </details>

              <div className="hidden space-y-5 xl:block">
                {[
                  ["Key attractions", result.must_visit_attractions],
                  ["Food suggestions", result.local_foods],
                  ["Travel tips", result.travel_tips],
                ].map(([title, items]) => (
                  <Card key={title as string} className="glass-shell rounded-[30px] border-white/45 bg-white/56">
                    <CardContent className="p-6">
                      <p className="text-lg font-semibold text-[#0f3460]">{title}</p>
                      <div className="mt-4">
                        <OutputList items={items as string[]} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {refineOpen ? (
            <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(8,18,38,0.35)] p-4 backdrop-blur-md sm:items-center sm:p-6">
              <div className="absolute inset-0" onClick={() => setRefineOpen(false)} />
              <Card className="glass-shell relative max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-[28px] border-white/45 bg-white/78 shadow-[0_30px_80px_rgba(14,55,94,0.22)] sm:rounded-[32px]">
                <CardContent className="space-y-5 overflow-y-auto p-6 sm:p-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <SectionTitle
                      eyebrow="Refine with AI"
                      title="Adjust this trip like a conversation"
                      description="Ask for changes naturally and Wandrly will create a new itinerary version instead of overwriting the current one."
                    />
                    <button
                      type="button"
                      onClick={() => setRefineOpen(false)}
                      className="rounded-full border border-white/45 bg-white/70 px-4 py-2 text-sm text-[#61738C] transition hover:bg-white/90"
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      "Make this trip more budget-friendly",
                      "Add one scenic day trip",
                      "Make the pacing slower and more luxurious",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setRefinePrompt(suggestion)}
                        className="rounded-[18px] border border-white/45 bg-white/62 p-4 text-left text-sm leading-7 text-[#46617c] transition hover:bg-white/88"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-[24px] border border-white/45 bg-white/56 p-4">
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
                                  ? "ml-auto max-w-[88%] border-[#14518b]/18 bg-[#eef4fb]"
                                  : "mr-auto max-w-[92%] border-white/45 bg-white/72"
                              )}
                            >
                              <p className="text-xs uppercase tracking-[0.2em] text-[#7a8ea8]">
                                {isUser ? "You" : "Wandrly AI"}
                              </p>
                              <p className="mt-2 text-sm leading-7 text-[#46617c]">{message.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-[18px] border border-dashed border-white/45 bg-white/64 p-4 text-sm leading-7 text-[#61738C]">
                        No refinement history yet. Ask Wandrly to slow the pace, change the budget feel, or reshape specific days.
                      </div>
                    )}

                    <form className="mt-4 space-y-3" onSubmit={handleRefineSubmit}>
                      <textarea
                        value={refinePrompt}
                        onChange={(event) => setRefinePrompt(event.target.value)}
                        placeholder="Make day 2 more budget-friendly and add one quieter dinner recommendation."
                        className="min-h-[130px] w-full rounded-[18px] border border-white/55 bg-white/88 px-4 py-4 text-sm leading-7 text-[#1A1C1B] placeholder:text-[#8A96A8] focus:border-[#14518b]/30 focus:ring-2 focus:ring-[#14518b]/10"
                      />
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-[#61738C]">
                          Every refinement creates a new saved itinerary version.
                        </p>
                        <Button
                          type="submit"
                          disabled={isRefining || !selectedVersionId}
                          className="rounded-full px-6"
                        >
                          <MessageSquareText className="size-4" />
                          {isRefining ? "Refining..." : "Refine itinerary"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="xl:hidden">
              <Button variant="outline" onClick={() => setRefineOpen(true)} className="w-full rounded-full">
                Refine with AI
              </Button>
            </div>
          )}

          <div className="fixed inset-x-4 bottom-20 z-40 md:hidden">
            <div className="glass-shell flex flex-col gap-3 rounded-[28px] px-4 py-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-[#7a8ea8]">
                  {nextWorkspaceStep?.eyebrow || "Trip ready"}
                </p>
                <p className="text-sm font-semibold text-[#0f3460]">{headerDestination}</p>
              </div>
              {nextWorkspaceStep ? (
                <Link href={nextWorkspaceStep.href}>
                  <Button className="w-full rounded-full">{nextWorkspaceStep.label}</Button>
                </Link>
              ) : null}
              <Button variant="outline" onClick={handleStartNewBrief} className="w-full rounded-full">
                Start a new brief
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
