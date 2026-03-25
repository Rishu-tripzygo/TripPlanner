"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AITripPlannerRequest,
  hotelCategoryOptions,
  interestOptions,
  travelStyleOptions,
  tripPurposeOptions,
} from "@/lib/ai-trip-types";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles } from "lucide-react";

const emptyForm: AITripPlannerRequest = {
  destination: "",
  purpose: tripPurposeOptions[0],
  days: 5,
  travelers: 2,
  budgetRange: "",
  travelStyle: travelStyleOptions[1],
  interests: ["Food", "Culture"],
  hotelCategory: hotelCategoryOptions[1],
  travelDates: "",
};

export default function GuestTripPlanner({
  initialDraft,
}: {
  initialDraft?: Partial<AITripPlannerRequest>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<AITripPlannerRequest>({
    ...emptyForm,
    ...initialDraft,
  });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => Boolean(form.destination.trim()) && form.interests.length > 0 && form.days >= 1,
    [form]
  );

  function updateField<K extends keyof AITripPlannerRequest>(
    field: K,
    value: AITripPlannerRequest[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleInterest(interest: string) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setStatus("Designing your guest preview...");

    try {
      const response = await fetch("/api/guest-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.previewToken) {
          router.push(`/preview/${data.previewToken}`);
          return;
        }

        throw new Error(data.error || "Unable to generate preview.");
      }

      router.push(`/preview/${data.previewToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate preview.");
    } finally {
      setLoading(false);
      setStatus(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="app-shell rounded-[32px] border border-white/55 bg-white/56 p-6 shadow-[0_18px_40px_rgba(22,40,64,0.08)] backdrop-blur-[24px] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-label">Guest preview</p>
            <h2 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.3rem] font-bold leading-[0.95] tracking-[-0.04em] text-[#0f3460] sm:text-[2.9rem]">
              Try one real AI itinerary before you sign in.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[#61738C] sm:text-base">
              Fill the essentials, let Wandrly draft the itinerary, and save it to your account
              once you are ready to continue.
            </p>
          </div>
          <div className="rounded-full border border-white/55 bg-white/72 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#14518b]">
            1 guest preview
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#0f3460]">Destination</span>
              <input
                value={form.destination}
                onChange={(event) => updateField("destination", event.target.value)}
                placeholder="Bali, Japan, Amalfi Coast..."
                className="h-14 w-full rounded-[20px] border border-white/55 bg-white/78 px-4 text-sm text-[#0f3460] outline-none transition focus:border-[#8db7e0] focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#0f3460]">Travel dates</span>
              <input
                value={form.travelDates || ""}
                onChange={(event) => updateField("travelDates", event.target.value)}
                placeholder="15 Apr - 20 Apr"
                className="h-14 w-full rounded-[20px] border border-white/55 bg-white/78 px-4 text-sm text-[#0f3460] outline-none transition focus:border-[#8db7e0] focus:bg-white"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#0f3460]">Purpose</span>
              <select
                value={form.purpose}
                onChange={(event) => updateField("purpose", event.target.value)}
                className="h-14 w-full rounded-[20px] border border-white/55 bg-white/78 px-4 text-sm text-[#0f3460] outline-none"
              >
                {tripPurposeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#0f3460]">Days</span>
              <input
                type="number"
                min={1}
                max={21}
                value={form.days}
                onChange={(event) => updateField("days", Number(event.target.value))}
                className="h-14 w-full rounded-[20px] border border-white/55 bg-white/78 px-4 text-sm text-[#0f3460] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#0f3460]">Travelers</span>
              <input
                type="number"
                min={1}
                max={20}
                value={form.travelers}
                onChange={(event) => updateField("travelers", Number(event.target.value))}
                className="h-14 w-full rounded-[20px] border border-white/55 bg-white/78 px-4 text-sm text-[#0f3460] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#0f3460]">Travel style</span>
              <select
                value={form.travelStyle}
                onChange={(event) => updateField("travelStyle", event.target.value)}
                className="h-14 w-full rounded-[20px] border border-white/55 bg-white/78 px-4 text-sm text-[#0f3460] outline-none"
              >
                {travelStyleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[#0f3460]">What matters most on this trip?</span>
              <button
                type="button"
                onClick={() => setAdvancedOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/68 px-4 py-2 text-sm font-medium text-[#14518b]"
              >
                Advanced preferences
                <ChevronDown className={`size-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => {
                const active = form.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      active
                        ? "bg-[#14518b] text-white shadow-[0_12px_24px_rgba(20,81,139,0.18)]"
                        : "border border-white/55 bg-white/68 text-[#46617c]"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {advancedOpen ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#0f3460]">Budget range</span>
                <input
                  value={form.budgetRange || ""}
                  onChange={(event) => updateField("budgetRange", event.target.value)}
                  placeholder="Mid-range, INR 12k per day"
                  className="h-14 w-full rounded-[20px] border border-white/55 bg-white/78 px-4 text-sm text-[#0f3460] outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#0f3460]">Stay preference</span>
                <select
                  value={form.hotelCategory}
                  onChange={(event) => updateField("hotelCategory", event.target.value)}
                  className="h-14 w-full rounded-[20px] border border-white/55 bg-white/78 px-4 text-sm text-[#0f3460] outline-none"
                >
                  {hotelCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[20px] border border-[rgba(186,62,62,0.18)] bg-[rgba(255,244,244,0.92)] px-4 py-4 text-sm leading-7 text-[#8c3f3f]">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-7 text-[#61738C]">
              {status || "You can generate one preview without an account, then sign in to save it."}
            </p>
            <Button
              type="submit"
              disabled={!canSubmit || loading}
              className="min-w-[220px] rounded-full px-6 py-6 text-base"
            >
              {loading ? "Generating preview..." : "Generate guest preview"}
              <Sparkles className="size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
