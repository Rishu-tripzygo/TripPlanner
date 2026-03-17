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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
            <NotebookPen className="size-5" />
          </div>
          <div>
            <p className="section-label">Destination Notes</p>
            <CardTitle className="text-2xl text-white">Ideas, reminders, and local tips</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <select
          value={selectedLocationId}
          onChange={(event) => setSelectedLocationId(event.target.value)}
          className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id} className="bg-[#0F1117]">
              {location.locationTitle}
            </option>
          ))}
        </select>

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a note like restaurant shortlist, taxi tip, or a photo spot reminder."
          className="min-h-[120px] w-full rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-white"
        />

        {error ? <p className="text-sm text-[#FFB4B4]">{error}</p> : null}

        <Button onClick={addNote} disabled={isSaving} className="w-full">
          <span className="inline-flex items-center gap-2">
            <Plus className="size-4" />
            {isSaving ? "Saving note..." : "Add Note"}
          </span>
        </Button>

        <div className="space-y-3">
          {isLoading ? (
            <div className="h-[120px] animate-pulse rounded-[16px] border border-white/8 bg-white/[0.03]" />
          ) : notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.id}
                className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4"
              >
                <p className="text-sm leading-7 text-[#D8E2F1]">{note.content}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#4A5568]">
                  Updated {new Date(note.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[16px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-[#8B9BB4]">
              No notes saved for this destination yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
