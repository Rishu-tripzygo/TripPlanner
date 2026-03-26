"use client";

import { AssistantMessageRecord } from "@/lib/phase-one-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, MessageSquareText, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface AssistantTripOption {
  id: string;
  title: string;
}

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

      const assistantContent = data.content;

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: assistantContent,
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
      <section className="grid gap-8 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="overflow-hidden rounded-[34px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,243,237,0.88))] p-8 shadow-[0_20px_44px_rgba(26,28,27,0.07)] backdrop-blur-[18px]">
          <p className="section-label">Assistant</p>
          <h1 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[42px] font-bold leading-[0.94] tracking-[-0.05em] text-[#024785] sm:text-[48px]">
            A travel copilot that understands your current trip.
          </h1>
          <p className="mt-5 text-sm leading-8 text-[#61738C]">
            Ask about planning, safety, route decisions, restaurant ideas, visa questions,
            weather timing, or logistics. Attach a trip to make the answer context-aware.
          </p>

          <div className="mt-8 rounded-[26px] border border-white/55 bg-[linear-gradient(180deg,rgba(248,244,239,0.88),rgba(242,238,232,0.82))] p-5 shadow-[0_12px_24px_rgba(20,81,139,0.04)]">
            <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#024785]">
              Attach trip context
            </label>
            <select
              value={tripId}
              onChange={(event) => setTripId(event.target.value)}
              className="mt-3 w-full rounded-[18px] border border-[rgba(20,81,139,0.1)] bg-white/92 px-4 py-3 text-sm text-[#1A1C1B] outline-none transition focus:border-[#14518b]/20"
            >
              <option value="">Ask generally first</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title}
                </option>
              ))}
            </select>

            {attachedTrip ? (
              <div className="mt-4 rounded-[20px] border border-[rgba(20,81,139,0.1)] bg-white/92 px-4 py-4 shadow-[0_10px_22px_rgba(20,81,139,0.04)]">
                <p className="text-sm font-semibold text-[#024785]">{attachedTrip.title}</p>
                <p className="mt-1 text-sm leading-7 text-[#61738C]">
                  Use the assistant to refine the itinerary, improve the route, or decide what to
                  prepare next for this trip.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link href={`/trips/${attachedTrip.id}`}>
                    <Button variant="outline" className="rounded-full">
                      Open workspace
                    </Button>
                  </Link>
                  <Link href={`/ai-trip-planner?tripId=${attachedTrip.id}`}>
                    <Button variant="outline" className="rounded-full">
                      Refine itinerary
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[20px] border border-dashed border-[rgba(20,81,139,0.12)] bg-white/72 px-4 py-4 text-sm leading-7 text-[#61738C]">
                You can ask broad travel questions without attaching a trip. Attach one when you
                want Wandrly to answer against your saved itinerary and route.
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <p className="section-label">Try asking</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "What documents do I need for Bali in March?",
                  "Make my next trip more budget friendly.",
                  "Suggest a restaurant near my hotel area.",
                  "Slow down day 3 and reduce travel time.",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setQuestion(prompt)}
                    className="rounded-full border border-[rgba(20,81,139,0.1)] bg-white/88 px-4 py-2.5 text-sm text-[#3E536F] shadow-[0_8px_18px_rgba(20,81,139,0.03)] transition hover:border-[#14518b]/18 hover:text-[#14518b]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(247,243,237,0.72))] p-5">
              <p className="text-sm font-semibold text-[#024785]">Best ways to use Wandrly Assistant</p>
              <div className="mt-4 space-y-3">
                {[
                  "Improve pacing before you save a trip",
                  "Refine a saved itinerary after route confirmation",
                  "Ask prep questions once the trip is in the workspace",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-7 text-[#61738C]">
                    <ArrowRight className="mt-1 size-4 shrink-0 text-[#14518b]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[34px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.93),rgba(247,243,237,0.88))] shadow-[0_20px_44px_rgba(26,28,27,0.07)] backdrop-blur-[18px]">
          <div className="border-b border-[rgba(20,81,139,0.08)] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#EEF2F8] p-3 text-[#024785]">
                <MessageSquareText className="size-5" />
              </div>
              <div>
                <p className="section-label">Conversation</p>
                <p className="mt-1 text-sm text-[#61738C]">Wandrly Assistant</p>
              </div>
            </div>
          </div>

          <div className="max-h-[520px] space-y-4 overflow-y-auto px-6 py-6">
            {messages.length === 1 ? (
              <div className="rounded-[22px] border border-dashed border-[rgba(20,81,139,0.12)] bg-[rgba(250,249,247,0.86)] p-5 text-sm leading-7 text-[#61738C]">
                Start with one question and Wandrly will respond like a travel copilot. Ask for a
                route improvement, a better stay area, a cheaper version of the plan, or what to
                prepare next.
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
                      ? "ml-auto max-w-[86%] bg-[linear-gradient(135deg,#EAF1FB,#E2ECF9)] text-[#024785] shadow-[0_10px_20px_rgba(20,81,139,0.05)]"
                      : "mr-auto max-w-[90%] bg-[rgba(250,249,247,0.92)] text-[#3E536F] shadow-[0_10px_20px_rgba(26,28,27,0.04)]"
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

          <form onSubmit={handleSubmit} className="border-t border-[rgba(20,81,139,0.08)] p-6">
            <div className="rounded-[24px] border border-white/55 bg-[linear-gradient(180deg,rgba(248,244,239,0.9),rgba(242,238,232,0.82))] p-4">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about visa steps, safe timing, food, route improvements, or local recommendations..."
                className="min-h-[120px] w-full resize-none bg-transparent text-sm leading-8 text-[#1A1C1B] outline-none placeholder:text-[#8A96A8]"
              />
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#7A879B]">
                  <Sparkles className="size-3.5 text-[#024785]" />
                  Context-aware when a trip is attached
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
