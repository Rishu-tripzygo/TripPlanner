"use client";

import { SearchResultRecord } from "@/lib/phase-one-types";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const categoryLabels: Record<SearchResultRecord["category"], string> = {
  trip: "Trip",
  destination: "Destination",
  journal: "Journal",
  note: "Note",
  "public-trip": "Explore",
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as SearchResultRecord[];
        if (response.ok) {
          setResults(data);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [open, query]);

  const hint = useMemo(() => {
    if (query.trim().length < 2) return "Search trips, destinations, notes, journals, and public itineraries.";
    if (isLoading) return "Searching across your workspace and the explore feed...";
    if (results.length === 0) return "No matching results yet.";
    return `${results.length} result${results.length === 1 ? "" : "s"} found`;
  }, [isLoading, query, results.length]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center gap-3 rounded-full bg-[#F4F3F1] px-4 py-2 text-sm text-[#61738C] transition hover:text-[#024785]"
      >
        <Search className="size-4 text-[#024785]" />
        <span className="truncate">Search anywhere</span>
        <span className="rounded-full border border-[rgba(2,71,133,0.08)] bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[#7A879B]">
          Cmd+K
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[120] bg-[#0A1222]/32 px-4 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-[32px] border border-[rgba(2,71,133,0.08)] bg-white shadow-[0_24px_60px_rgba(26,28,27,0.12)]">
            <div className="border-b border-[rgba(2,71,133,0.08)] px-6 py-5">
              <div className="flex items-center gap-3 rounded-[20px] bg-[#F4F3F1] px-4 py-4">
                <Search className="size-4 text-[#024785]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search trips, destinations, notes, journals, or public trips"
                  className="w-full bg-transparent text-sm text-[#1A1C1B] outline-none placeholder:text-[#8A96A8]"
                />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#7A879B]">{hint}</p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {query.trim().length < 2 ? (
                <div className="rounded-[20px] bg-[#F4F3F1] p-5 text-sm leading-8 text-[#61738C]">
                  Start typing to search your workspace and discover public itineraries.
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result) => (
                    <Link
                      key={`${result.category}-${result.id}`}
                      href={result.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-[20px] bg-[#FAF9F7] p-5 transition hover:bg-[#F4F3F1]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-[#1A1C1B]">{result.title}</p>
                          <p className="mt-2 text-sm text-[#61738C]">{result.subtitle}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#024785]">
                          {categoryLabels[result.category]}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between border-t border-[rgba(2,71,133,0.08)] px-6 py-4 text-xs text-[#7A879B]">
              <span>Quick jump for real workspace navigation.</span>
              <span className="inline-flex items-center gap-2 text-[#024785]">
                <Sparkles className="size-3.5" />
                Search across Wandrly
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
