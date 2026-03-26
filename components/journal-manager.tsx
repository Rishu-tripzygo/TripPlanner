"use client";

import { useMemo, useState } from "react";
import { UploadButton } from "@/lib/upload-thing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalEntryRecord } from "@/lib/phase-one-types";
import { BookOpenText, Camera, Download, Save } from "lucide-react";

const surfaceCard =
  "border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] text-[#1A1C1B] backdrop-blur-[18px]";

export default function JournalManager({
  tripId,
  tripTitle,
  tripDays,
  initialEntries,
}: {
  tripId: string;
  tripTitle: string;
  tripDays: number;
  initialEntries: JournalEntryRecord[];
}) {
  const [entries, setEntries] = useState<JournalEntryRecord[]>(initialEntries);
  const [selectedDay, setSelectedDay] = useState(initialEntries[0]?.day || 1);
  const [content, setContent] = useState(
    initialEntries.find((entry) => entry.day === (initialEntries[0]?.day || 1))?.content || ""
  );
  const [photos, setPhotos] = useState<string[]>(
    initialEntries.find((entry) => entry.day === (initialEntries[0]?.day || 1))?.photos || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const orderedEntries = useMemo(() => [...entries].sort((a, b) => a.day - b.day), [entries]);

  function syncSelectedDay(day: number) {
    setSelectedDay(day);
    const existing = entries.find((entry) => entry.day === day);
    setContent(existing?.content || "");
    setPhotos(existing?.photos || []);
    setError(null);
  }

  async function saveEntry() {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/journal/${tripId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: selectedDay,
          content,
          photos,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save journal entry.");
      }

      const nextEntry = data as JournalEntryRecord;
      setEntries((current) => {
        const filtered = current.filter((entry) => entry.day !== nextEntry.day);
        return [...filtered, nextEntry];
      });
      setSuccessMessage(`Day ${selectedDay} saved to your trip memory timeline.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save journal entry.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="landing-shell space-y-8 px-4 py-8 sm:px-5 lg:px-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className={surfaceCard}>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-label">Trip Journal</p>
                <CardTitle className="font-[family-name:var(--font-noto-serif)] text-[40px] text-[#024785]">
                  {tripTitle}
                </CardTitle>
                <p className="mt-3 text-sm leading-7 text-[#61738C]">
                  Capture what happened each day so the trip becomes a memory timeline, not just a
                  plan. Add reflections, moments, and supporting photos as you go.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => window.print()}>
                <span className="inline-flex items-center gap-2">
                  <Download className="size-4" />
                  Export PDF
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <p className="text-sm text-[#61738C]">Trip length</p>
              <p className="mt-2 text-2xl font-semibold text-[#024785]">{tripDays} days</p>
            </div>
            <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <p className="text-sm text-[#61738C]">Saved entries</p>
              <p className="mt-2 text-2xl font-semibold text-[#024785]">{entries.length}</p>
            </div>
            <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <p className="text-sm text-[#61738C]">Selected day</p>
              <p className="mt-2 text-2xl font-semibold text-[#024785]">Day {selectedDay}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={surfaceCard}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                <BookOpenText className="size-5" />
              </div>
              <div>
                <p className="section-label">Editor</p>
                <CardTitle className="text-2xl text-[#024785]">Write your day memory</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={selectedDay}
              onChange={(event) => syncSelectedDay(Number(event.target.value))}
              className="w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-sm text-[#1A1C1B] outline-none transition focus:border-[#14518b]/20"
            >
              {Array.from({ length: tripDays }, (_, index) => index + 1).map((day) => (
                <option key={day} value={day} className="bg-white text-[#1A1C1B]">
                  Day {day}
                </option>
              ))}
            </select>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="What stood out today? Add details about places, food, moments, or surprises."
              className="min-h-[220px] w-full rounded-[18px] border border-[rgba(20,81,139,0.1)] bg-white/84 px-4 py-3 text-sm leading-7 text-[#1A1C1B] outline-none transition focus:border-[#14518b]/20"
            />

            <UploadButton
              endpoint="imageUploader"
              appearance={{
                button:
                  "ut-ready:bg-[linear-gradient(135deg,#1B3A6B,#00C2FF)] ut-ready:text-white ut-ready:border-0",
                container: "w-full",
              }}
              onClientUploadComplete={(files) => {
                const file = files?.[0];
                if (!file) return;
                setPhotos((current) => [...current, file.ufsUrl]);
              }}
              onUploadError={(uploadError: Error) => {
                setError(uploadError.message);
              }}
            />

            {photos.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {photos.map((photo, index) => (
                  <div
                    key={`${photo}-${index}`}
                    className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-4"
                  >
                    <div className="mb-2 flex items-center gap-2 text-sm text-[#415873]">
                      <Camera className="size-4 text-[#14518b]" />
                      Photo {index + 1}
                    </div>
                    <a
                      href={photo}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-sm text-[#61738C] underline-offset-4 hover:text-[#14518b] hover:underline"
                    >
                      {photo}
                    </a>
                  </div>
                ))}
              </div>
            ) : null}

            {error ? <p className="text-sm text-[#B84A43]">{error}</p> : null}
            {!error && successMessage ? (
              <p className="text-sm text-[#14518b]">{successMessage}</p>
            ) : null}

            <Button onClick={saveEntry} disabled={isSaving} className="w-full">
              <span className="inline-flex items-center gap-2">
                <Save className="size-4" />
                {isSaving ? "Saving..." : "Save Journal Entry"}
              </span>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className={surfaceCard}>
        <CardHeader>
          <CardTitle className="text-2xl text-[#024785]">Trip memory timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderedEntries.length > 0 ? (
            orderedEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-[#8A96A8]">Day {entry.day}</p>
                <p className="mt-3 text-sm leading-8 text-[#415873]">{entry.content}</p>
                {entry.photos.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.photos.map((photo, index) => (
                      <a
                        key={`${entry.id}-${index}`}
                        href={photo}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[rgba(20,81,139,0.08)] bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#415873]"
                      >
                        Photo {index + 1}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-[18px] border border-dashed border-[rgba(20,81,139,0.12)] bg-white/68 p-5 text-sm leading-7 text-[#61738C]">
              No journal entries yet. Start with the first meaningful day and build a memory
              timeline that captures places, moments, meals, and highlights as the trip unfolds.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
