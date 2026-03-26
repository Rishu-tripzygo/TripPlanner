"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadButton } from "@/lib/upload-thing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Copy, ImagePlus, Settings2, Trash2 } from "lucide-react";

const surfaceCard =
  "border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] text-[#1A1C1B] backdrop-blur-[18px]";

export default function TripSettingsPanel({
  trip,
}: {
  trip: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string | null;
    startDate: string;
    endDate: string;
    activeItineraryDays: number;
    confirmedStopsCount: number;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: trip.title,
    description: trip.description,
    imageUrl: trip.imageUrl || "",
    startDate: trip.startDate.slice(0, 10),
    endDate: trip.endDate.slice(0, 10),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function saveSettings() {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update trip settings.");
      }

      setForm({
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl || "",
        startDate: data.startDate.slice(0, 10),
        endDate: data.endDate.slice(0, 10),
      });
      setSuccessMessage("Trip settings updated. The workspace now uses the new trip shell.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update trip settings.");
    } finally {
      setIsSaving(false);
    }
  }

  async function duplicateTrip() {
    setIsDuplicating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/trips/${trip.id}/duplicate`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to duplicate trip.");
      }

      router.push(`/trips/${data.id}`);
      router.refresh();
    } catch (duplicateError) {
      setError(duplicateError instanceof Error ? duplicateError.message : "Unable to duplicate the trip.");
    } finally {
      setIsDuplicating(false);
    }
  }

  async function deleteTrip() {
    const confirmed = window.confirm(
      "Delete this trip permanently? This removes its route, itinerary versions, packing list, documents, notes, and journal entries."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete trip.");
      }

      router.push("/trips");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete the trip.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="landing-shell space-y-8 px-4 py-8 sm:px-5 lg:px-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className={surfaceCard}>
          <CardHeader>
            <p className="section-label">Trip Settings</p>
            <CardTitle className="font-[family-name:var(--font-noto-serif)] text-[40px] text-[#024785]">
              {trip.title}
            </CardTitle>
            <p className="text-sm leading-7 text-[#61738C]">
              Update the trip shell without touching your saved itinerary versions. If the dates
              change significantly, it is still smart to review the itinerary and route afterward.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                <Settings2 className="size-5" />
              </div>
              <p className="text-sm text-[#61738C]">Active itinerary</p>
              <p className="mt-2 text-2xl font-semibold text-[#024785]">
                {trip.activeItineraryDays > 0 ? `${trip.activeItineraryDays} days saved` : "No itinerary yet"}
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                <Copy className="size-5" />
              </div>
              <p className="text-sm text-[#61738C]">Confirmed route stops</p>
              <p className="mt-2 text-2xl font-semibold text-[#024785]">{trip.confirmedStopsCount}</p>
            </div>
            <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-[#FFF1E3] p-3 text-[#B76A20]">
                <AlertTriangle className="size-5" />
              </div>
              <p className="text-sm text-[#61738C]">Planning note</p>
              <p className="mt-2 text-sm leading-7 text-[#415873]">
                Date edits do not rewrite the itinerary automatically. Refine the trip after major
                changes.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={surfaceCard}>
          <CardHeader>
            <CardTitle className="text-2xl text-[#024785]">Edit trip shell</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Trip title"
              className="w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-sm text-[#1A1C1B] outline-none transition focus:border-[#14518b]/20"
            />
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Trip description"
              className="min-h-28 w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-sm text-[#1A1C1B] outline-none transition focus:border-[#14518b]/20"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, startDate: event.target.value }))
                }
                className="w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-sm text-[#1A1C1B] outline-none transition focus:border-[#14518b]/20"
              />
              <input
                type="date"
                value={form.endDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, endDate: event.target.value }))
                }
                className="w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-sm text-[#1A1C1B] outline-none transition focus:border-[#14518b]/20"
              />
            </div>

            <div className="rounded-[20px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#415873]">
                <ImagePlus className="size-4 text-[#14518b]" />
                Cover image
              </label>
              {form.imageUrl ? (
                <Image
                  src={form.imageUrl}
                  alt="Trip cover"
                  className="mb-4 max-h-52 w-full rounded-[16px] object-cover"
                  width={500}
                  height={220}
                />
              ) : null}
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.ufsUrl) {
                    setForm((current) => ({ ...current, imageUrl: res[0].ufsUrl }));
                  }
                }}
                onUploadError={(uploadError: Error) => {
                  setError(uploadError.message);
                }}
              />
            </div>

            {error ? (
              <div className="rounded-[14px] border border-[#EF4444]/30 bg-[#FDECEC] px-4 py-3 text-sm text-[#B84A43]">
                {error}
              </div>
            ) : successMessage ? (
              <div className="rounded-[14px] border border-[#14518b]/15 bg-[#EEF4FB] px-4 py-3 text-sm text-[#14518b]">
                {successMessage}
              </div>
            ) : null}

            <Button onClick={saveSettings} className="w-full" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className={surfaceCard}>
        <CardHeader>
          <CardTitle className="text-2xl text-[#024785]">Trip controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
            <h2 className="text-lg font-semibold text-[#024785]">Duplicate for a future version</h2>
            <p className="mt-3 text-sm leading-7 text-[#61738C]">
              Create a copy with the current route, active itinerary, budget shell, and packing
              list so you can adapt it for another trip without starting from zero.
            </p>
            <Button onClick={duplicateTrip} variant="outline" className="mt-5" disabled={isDuplicating}>
              <span className="inline-flex items-center gap-2">
                <Copy className="size-4" />
                {isDuplicating ? "Duplicating..." : "Duplicate trip"}
              </span>
            </Button>
          </div>

          <div className="rounded-[18px] border border-[#EF4444]/18 bg-[#FFF1F1] p-5">
            <h2 className="text-lg font-semibold text-[#7A1F1F]">Danger zone</h2>
            <p className="mt-3 text-sm leading-7 text-[#9B4D4D]">
              Deleting this trip removes its route, itinerary versions, packing list, journal,
              documents, and saved planning history permanently.
            </p>
            <Button
              onClick={deleteTrip}
              variant="outline"
              className="mt-5 border-[#EF4444]/20 bg-white text-[#B84A43] hover:bg-[#FDECEC]"
              disabled={isDeleting}
            >
              <span className="inline-flex items-center gap-2">
                <Trash2 className="size-4" />
                {isDeleting ? "Deleting..." : "Delete trip"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
