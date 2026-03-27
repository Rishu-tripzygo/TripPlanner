import { auth } from "@/auth";
import AssistantPanel from "@/components/assistant-panel";
import AuthButton from "@/components/auth-button";
import { demoAssistantPrompts } from "@/lib/demo-content";
import { prisma } from "@/lib/prisma";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default async function AssistantPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="landing-shell grid gap-8 rounded-[36px] border border-[rgba(2,71,133,0.08)] bg-[linear-gradient(180deg,#ffffff,#f6f4ef)] px-6 py-8 shadow-[0_20px_40px_rgba(26,28,27,0.06)] lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:py-10">
          <div className="max-w-xl">
            <p className="section-label">Assistant</p>
            <h1 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[44px] font-bold leading-[0.92] tracking-[-0.05em] text-[#024785] sm:text-[58px]">
              A calmer travel assistant, not a cluttered sidebar.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#61738C]">
              Ask Wandrly to improve an itinerary, suggest better stay areas, reduce budget strain,
              or explain what to prepare next. Once you sign in, it can answer with your actual trip
              context in mind.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {demoAssistantPrompts.slice(0, 4).map((prompt) => (
                <div
                  key={prompt}
                  className="rounded-full border border-white/55 bg-white/62 px-4 py-3 text-sm text-[#415873] shadow-[0_10px_22px_rgba(20,81,139,0.04)] backdrop-blur-xl"
                >
                  {prompt}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <AuthButton
                  isLoggedIn={false}
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#024785,#2B5F9E)] px-6 py-3 text-sm font-semibold text-white"
                >
                  Sign in to use the assistant
              </AuthButton>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center rounded-full border border-white/55 bg-white/68 px-6 py-3 text-sm font-semibold text-[#14518b]"
              >
                Explore Sample Trips
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/55 bg-white/58 p-5 shadow-[0_18px_38px_rgba(26,28,27,0.06)] backdrop-blur-[24px]">
            <div className="rounded-[24px] border border-white/55 bg-[#FAF9F7]/88 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="section-label text-[#14518b]">Preview conversation</p>
                  <p className="mt-1 text-sm text-[#61738C]">What the assistant helps with</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="ml-auto max-w-[82%] rounded-[20px] bg-[#EEF2F8] p-4 text-sm leading-7 text-[#024785]">
                  Make my Tokyo trip more budget-friendly without losing the best experiences.
                </div>
                <div className="mr-auto max-w-[88%] rounded-[20px] bg-white p-4 text-sm leading-7 text-[#415873] shadow-[0_10px_24px_rgba(20,81,139,0.05)]">
                  I can rebalance the stay area, replace one premium dinner with a strong mid-range
                  option, tighten local transfers, and keep the best cultural highlights. Once you
                  attach a trip, I&apos;ll answer against your saved itinerary directly.
                </div>
                <div className="ml-auto max-w-[78%] rounded-[20px] bg-[#EEF2F8] p-4 text-sm leading-7 text-[#024785]">
                  What should I ask next?
                </div>
                <div className="mr-auto max-w-[88%] rounded-[20px] bg-white p-4 text-sm leading-7 text-[#415873] shadow-[0_10px_24px_rgba(20,81,139,0.05)]">
                  Try asking for better stay neighborhoods, family-friendly pacing, document checks,
                  or a cleaner route between stops.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
    },
  });

  return <AssistantPanel trips={trips} />;
}
