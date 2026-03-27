"use client";

import { AssistantMessageRecord } from "@/lib/phase-one-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Compass, MessageSquareText, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface AssistantTripOption {
  id: string;
  title: string;
}

const suggestedPrompts = [
  "What documents do I need for Bali in March?",
  "Make my next trip more budget friendly.",
  "Suggest a restaurant near my hotel area.",
  "Slow down day 3 and reduce travel time.",
];

export default function AssistantPanel({
  trips,
}: {
  trips: AssistantTripOption[];
}) {
  const [messages, setMessages] = useState<AssistantMessageRecord[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "Ask about routes, safety, planning, restaurants, timing, or trip prep. Attach a trip if you want the assistant to answer with your current itinerary context.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [tripId, setTripId] = useState("");
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attachedTrip = trips.find((trip) => trip.id === tripId) || null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;

    const userMessage: AssistantMessageRecord = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setQuestion("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage.content,
          tripId: tripId || undefined,
          history: nextMessages.slice(-8).map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = (await response.json()) as { content?: string; error?: string; details?: string };
      if (!response.ok || !data.content) {
        throw new Error(data.details || data.error || "Assistant request failed.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.content!,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Assistant request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="landing-shell space-y-8 px-4 py-8 sm:px-5 lg:px-6">
      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,243,237,0.88))] p-6 shadow-[0_20px_44px_rgba(26,28,27,0.07)] backdrop-blur-[18px]">
          <p className="section-label">Assistant</p>
          <h1 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.3rem] font-bold leading-[0.98] tracking-[-0.05em] text-[#024785]">
            Chat with your trip.
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#61738C]">
            Keep this focused. Ask one question, attach a trip when needed, and refine from there.
          </p>

          <div className="mt-6 rounded-[24px] border border-white/55 bg-white/78 p-4">
            <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#024785]">
              Trip context
            </label>
            <select
              value={tripId}
              onChange={(event) => setTripId(event.target.value)}
              className="mt-3 w-full rounded-[18px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-sm text-[#1A1C1B] outline-none transition focus:border-[#14518b]/20"
            >
              <option value="">General travel help</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title}
                </option>
              ))}
            </select>

            {attachedTrip ? (
              <div className="mt-4 rounded-[18px] bg-[#F6F4EF] p-4">
                <p className="text-sm font-semibold text-[#024785]">{attachedTrip.title}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/trips/${attachedTrip.id}`}>
                    <Button variant="outline" size="sm" className="rounded-full">
                      Open trip
                    </Button>
                  </Link>
                  <Link href={`/ai-trip-planner?tripId=${attachedTrip.id}`}>
                    <Button variant="outline" size="sm" className="rounded-full">
                      Refine
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[18px] border border-dashed border-[rgba(20,81,139,0.12)] bg-white/72 px-4 py-4 text-sm leading-7 text-[#61738C]">
                Attach a saved trip when you want answers against your actual itinerary and route.
              </div>
            )}
          </div>

          <div className="mt-6">
            <p className="section-label">Quick prompts</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuestion(prompt)}
                  className="rounded-full border border-[rgba(20,81,139,0.1)] bg-white/88 px-4 py-2.5 text-left text-sm text-[#3E536F] shadow-[0_8px_18px_rgba(20,81,139,0.03)] transition hover:border-[#14518b]/18 hover:text-[#14518b]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="overflow-hidden rounded-[34px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.93),rgba(247,243,237,0.88))] shadow-[0_20px_44px_rgba(26,28,27,0.07)] backdrop-blur-[18px]">
          <div className="border-b border-[rgba(20,81,139,0.08)] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#EEF2F8] p-3 text-[#024785]">
                  <MessageSquareText className="size-5" />
                </div>
                <div>
                  <p className="section-label">Conversation</p>
                  <p className="mt-1 text-sm text-[#61738C]">Wandrly Assistant</p>
                </div>
              </div>
              {attachedTrip ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/74 px-4 py-2 text-sm text-[#526980]">
                  <Compass className="size-4 text-[#14518b]" />
                  <span className="truncate">{attachedTrip.title}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="min-h-[54vh] max-h-[62vh] space-y-4 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            {messages.length === 1 ? (
              <div className="rounded-[22px] border border-dashed border-[rgba(20,81,139,0.12)] bg-[rgba(250,249,247,0.86)] p-5 text-sm leading-7 text-[#61738C]">
                Start with one question. Ask for route improvements, cheaper pacing, better stay
                areas, document checks, or what to prepare next.
              </div>
            ) : null}

            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-[20px] p-4 text-sm leading-8",
                    isUser
                      ? "ml-auto max-w-[88%] bg-[linear-gradient(135deg,#EAF1FB,#E2ECF9)] text-[#024785] shadow-[0_10px_20px_rgba(20,81,139,0.05)]"
                      : "mr-auto max-w-[92%] bg-[rgba(250,249,247,0.92)] text-[#3E536F] shadow-[0_10px_20px_rgba(26,28,27,0.04)]"
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7A879B]">
                    {isUser ? "You" : "Assistant"}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap">{message.content}</p>
                </div>
              );
            })}

            {error ? (
              <div className="rounded-[18px] border border-[#EF4444]/20 bg-[#FDECEC] p-4 text-sm text-[#B84A43]">
                {error}
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-[rgba(20,81,139,0.08)] p-5 sm:p-6">
            <div className="rounded-[24px] border border-white/55 bg-[linear-gradient(180deg,rgba(248,244,239,0.9),rgba(242,238,232,0.82))] p-4">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about visa steps, safe timing, food, route improvements, or local recommendations..."
                className="min-h-[110px] w-full resize-none bg-transparent text-sm leading-8 text-[#1A1C1B] outline-none placeholder:text-[#8A96A8]"
              />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs uppercase tracking-[0.22em] text-[#7A879B]">
                  {attachedTrip ? "Using selected trip context" : "General travel context"}
                </p>
                <Button type="submit" disabled={isLoading}>
                  <Send className="size-4" />
                  {isLoading ? "Thinking..." : "Send"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
