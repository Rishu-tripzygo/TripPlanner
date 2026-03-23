"use client";

import AuthButton from "@/components/auth-button";
import DestinationCard from "@/components/destination-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CirclePlay,
  Globe2,
  MapPinned,
  PlaneTakeoff,
  Sparkles,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const heroImages = [
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1800&q=80",
];

const destinations = [
  {
    title: "Amalfi Coast",
    country: "Italy",
    budget: "INR 95k avg",
    season: "May to Sep",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Kyoto",
    country: "Japan",
    budget: "INR 68k avg",
    season: "Oct to Nov",
    image:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Santorini",
    country: "Greece",
    budget: "INR 92k avg",
    season: "Jun to Sep",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
  },
];

const steps = [
  {
    icon: <Sparkles className="size-5" />,
    title: "Plan with AI",
    text: "Tell Wandrly the destination, travel window, budget, and the kind of mood you want the trip to carry.",
  },
  {
    icon: <MapPinned className="size-5" />,
    title: "Build your route",
    text: "Save the AI draft into a real trip, then turn it into a map-aware workspace with destinations and logistics.",
  },
  {
    icon: <WalletCards className="size-5" />,
    title: "Travel organized",
    text: "Use budget, packing, documents, notes, and journals inside one calm system instead of scattered tools.",
  },
  {
    icon: <Globe2 className="size-5" />,
    title: "Remember everything",
    text: "Keep a lasting travel record through journals, photos, public sharing, and your globe-based travel history.",
  },
];

export default function LandingPageClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="pb-28 md:pb-0">
      <section className="relative overflow-hidden px-4 pt-8 sm:px-6 lg:px-8">
        <div className="app-shell overflow-hidden rounded-[40px] border border-[rgba(2,71,133,0.08)] bg-[#F4F3F1] shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
          <div className="relative min-h-[78svh]">
            <div className="absolute inset-0">
              {heroImages.map((image, index) => (
                <motion.div
                  key={image}
                  animate={{
                    opacity: activeImage === index ? 1 : 0,
                    scale: activeImage === index ? 1 : 1.03,
                  }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${image})` }}
                />
              ))}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,249,247,0.34),rgba(250,249,247,0.6)_28%,rgba(250,249,247,0.92)_60%,#faf9f7_100%)]" />
            </div>

            <div className="relative z-10 flex min-h-[78svh] flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#024785] shadow-[0_12px_24px_rgba(26,28,27,0.06)] backdrop-blur-xl"
              >
                Bespoke Travel AI
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.06 }}
                className="mt-8 max-w-5xl font-[family-name:var(--font-noto-serif)] text-[56px] font-bold leading-[0.9] tracking-[-0.06em] text-[#024785] sm:text-[74px] lg:text-[96px]"
              >
                Plan Less.
                <br />
                Travel More.
                <br />
                <span className="font-normal italic text-[#1B3A6B]">Remember Everything.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="mt-6 max-w-2xl text-base leading-8 text-[#4B5F79] sm:text-lg"
              >
                Wandrly is a premium AI travel planner that takes you from trip idea to
                executable itinerary, then keeps the whole journey organized through maps,
                budgets, documents, packing, and journals.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.18 }}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <AuthButton
                  isLoggedIn={isLoggedIn}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#024785,#2B5F9E)] px-8 py-4 text-base font-semibold text-white shadow-[0_20px_40px_rgba(2,71,133,0.16)] transition hover:brightness-105"
                >
                  Plan with AI
                  <ArrowRight className="size-4" />
                </AuthButton>
                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-[#024785] shadow-[0_12px_24px_rgba(26,28,27,0.06)] transition hover:bg-[#F4F3F1]">
                  <CirclePlay className="size-5" />
                  Explore destinations
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.24 }}
                className="mt-10 grid w-full max-w-5xl gap-3 rounded-[28px] border border-white/60 bg-white/70 p-4 shadow-[0_20px_40px_rgba(26,28,27,0.06)] backdrop-blur-xl lg:grid-cols-[1.4fr_1fr_0.8fr_auto]"
              >
                {[
                  ["Destination", "Amalfi Coast, Italy"],
                  ["Travel window", "14 Sep - 20 Sep"],
                  ["Travelers", "2 adults"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[20px] bg-[#F4F3F1] px-4 py-4 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7B8CA3]">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#1A1C1B]">{value}</p>
                  </div>
                ))}
                <Link href="/ai-trip-planner">
                  <Button className="h-full w-full rounded-[20px] px-5">Generate itinerary</Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="app-shell flex flex-col gap-5 rounded-[30px] bg-[#F4F3F1] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {["A", "S", "R", "M"].map((initial) => (
                <div
                  key={initial}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#F4F3F1] bg-[#024785] text-sm font-semibold text-white"
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-sm text-[#4B5F79]">
              Join <span className="font-semibold text-[#024785]">12,847+</span> travelers today
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-8 text-sm text-[#61738C]">
            <span className="font-[family-name:var(--font-noto-serif)] text-xl text-[#1A1C1B]">
              VOGUE
            </span>
            <span className="font-[family-name:var(--font-noto-serif)] text-xl italic text-[#1A1C1B]">
              Conde Nast
            </span>
            <span className="font-[family-name:var(--font-noto-serif)] text-xl text-[#1A1C1B]">
              Traveler
            </span>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="app-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label">Designed for discerning travelers</p>
            <h2 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[42px] font-bold tracking-[-0.04em] text-[#024785] sm:text-[54px]">
              One calm space for planning, preparing, and reliving the journey
            </h2>
            <p className="mt-5 text-base leading-8 text-[#61738C]">
              The product flow is simple on purpose: plan with AI, save into a trip, build the
              route, then move into budget, packing, documents, notes, and memories.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-[34px] bg-white shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
              <div
                className="h-[460px] bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg,rgba(2,71,133,0.05),rgba(2,71,133,0.6)),url('https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1400&q=80')",
                }}
              />
              <div className="p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B84A43]">
                  AI curation
                </p>
                <h3 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[34px] font-bold tracking-[-0.03em] text-[#024785]">
                  An itinerary engine that understands pace, taste, and intent
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-[#61738C]">
                  Instead of just listing places, Wandrly drafts a trip with realistic flow,
                  hotel logic, local food recommendations, and flexible day alternatives you can
                  refine into your own version.
                </p>
              </div>
            </div>

            <div className="grid gap-8">
              {[
                {
                  title: "Everything in one place",
                  text: "Maps, itineraries, weather, budget, packing, documents, notes, and journals live in one coherent trip workspace.",
                },
                {
                  title: "Memories that last",
                  text: "When the trip is done, the same workspace becomes a travel archive through journals, photos, and sharing.",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className="rounded-[30px] bg-white p-8 shadow-[0_20px_40px_rgba(26,28,27,0.06)]"
                >
                  <div
                    className={`mb-5 inline-flex rounded-2xl p-3 ${
                      index === 0 ? "bg-[#E8F0FB] text-[#024785]" : "bg-[#FBEAE8] text-[#B84A43]"
                    }`}
                  >
                    {index === 0 ? <PlaneTakeoff className="size-5" /> : <Globe2 className="size-5" />}
                  </div>
                  <h3 className="font-[family-name:var(--font-noto-serif)] text-[28px] font-bold text-[#024785]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-8 text-[#61738C]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F3F1] px-4 py-24 sm:px-6 lg:px-8">
        <div className="app-shell">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="section-label">The journey to effortless</p>
              <h2 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[42px] font-bold tracking-[-0.04em] text-[#024785] sm:text-[54px]">
                Four clear steps from first idea to a fully prepared trip
              </h2>
            </div>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-[30px] bg-white p-8 shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
                <div
                  className={`mb-6 inline-flex rounded-2xl p-4 ${
                    index === 0
                      ? "bg-[#024785] text-white"
                      : index === 3
                        ? "bg-[#FBEAE8] text-[#B84A43]"
                        : "bg-[#F4F3F1] text-[#024785]"
                  }`}
                >
                  {step.icon}
                </div>
                <h3 className="font-[family-name:var(--font-noto-serif)] text-[28px] font-bold text-[#1A1C1B]">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-8 text-[#61738C]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="app-shell">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="section-label">Destination inspiration</p>
              <h2 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[42px] font-bold tracking-[-0.04em] text-[#024785] sm:text-[54px]">
                Escape routes worth planning properly
              </h2>
            </div>
            <Link href="/ai-trip-planner" className="hidden lg:inline-flex">
              <Button variant="outline">Start your plan</Button>
            </Link>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard key={destination.title} {...destination} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="app-shell overflow-hidden rounded-[40px] shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
          <div
            className="flex min-h-[360px] items-center justify-center bg-cover bg-center px-8 text-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg,rgba(2,71,133,0.18),rgba(2,71,133,0.44)),url('https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80')",
            }}
          >
            <div className="max-w-3xl">
              <h2 className="font-[family-name:var(--font-noto-serif)] text-[46px] font-bold tracking-[-0.04em] text-white sm:text-[64px]">
                The world is waiting.
              </h2>
              <p className="mt-4 text-base leading-8 text-white/85">
                Open one system, shape the trip, and keep every moving part connected from the
                first prompt to the final journal entry.
              </p>
              <div className="mt-8">
                <Link href={isLoggedIn ? "/trips" : "/ai-trip-planner"}>
                  <Button variant="outline" className="border-white/60 bg-white text-[#024785]">
                    Start your plan
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
