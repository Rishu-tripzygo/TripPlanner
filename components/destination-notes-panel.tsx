"use client";

import { useEffect, useState } from "react";
import { Location } from "@/app/generated/prisma";
import { NoteRecord } from "@/lib/phase-one-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotebookPen, Plus } from "lucide-react";

export default function DestinationNotesPanel({
  locations,
}: {
  locations: Location[];
}) {
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id || "");
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedLocationId) {
      setNotes([]);
      return;
    }

    let cancelled = false;

    async function loadNotes() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/notes/${selectedLocationId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load notes.");
        }

        if (!cancelled) {
          setNotes(data as NoteRecord[]);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load notes.");
          setNotes([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, [selectedLocationId]);

  async function addNote() {
    const content = draft.trim();
    if (!content || !selectedLocationId) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${selectedLocationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save note.");
      }

      setNotes((current) => [data as NoteRecord, ...current]);
      setDraft("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save note.");
    } finally {
      setIsSaving(false);
    }
  }

  if (locations.length === 0) {
    return null;
  }

  return (
    <Card className="border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] text-[#1A1C1B] backdrop-blur-[18px]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
            <NotebookPen className="size-5" />
          </div>
          <div>
            <p className="section-label">Destination Notes</p>
            <CardTitle className="text-2xl text-[#024785]">Ideas, reminders, and local tips</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <select
          value={selectedLocationId}
          onChange={(event) => setSelectedLocationId(event.target.value)}
          className="w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-sm text-[#1A1C1B]"
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id} className="bg-white text-[#1A1C1B]">
              {location.locationTitle}
            </option>
          ))}
        </select>

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a note like restaurant shortlist, taxi tip, or a photo spot reminder."
          className="min-h-[120px] w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white/84 px-4 py-3 text-sm leading-7 text-[#1A1C1B]"
        />

        {error ? <p className="text-sm text-[#B84A43]">{error}</p> : null}

        <Button onClick={addNote} disabled={isSaving} className="w-full">
          <span className="inline-flex items-center gap-2">
            <Plus className="size-4" />
            {isSaving ? "Saving note..." : "Add Note"}
          </span>
        </Button>

        <div className="space-y-3">
          {isLoading ? (
            <div className="h-[120px] animate-pulse rounded-[16px] border border-[rgba(20,81,139,0.08)] bg-white/70" />
          ) : notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.id}
                className="rounded-[16px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-4"
              >
                <p className="text-sm leading-7 text-[#415873]">{note.content}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8A96A8]">
                  Updated {new Date(note.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[16px] border border-dashed border-[rgba(20,81,139,0.12)] bg-white/68 p-5 text-sm leading-7 text-[#61738C]">
              No notes saved for this destination yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
