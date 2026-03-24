"use client";

import DestinationCard from "@/components/destination-card";
import { demoTripPreview } from "@/lib/demo-content";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock3,
  Compass,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const heroImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=80",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=2200&q=80",
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2200&q=80",
];

const featuredDestinations = [
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
  {
    title: "Marrakech",
    country: "Morocco",
    budget: "INR 74k avg",
    season: "Oct to Apr",
    image:
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1200&q=80",
  },
];

const featureCards = [
  {
    icon: Sparkles,
    title: "AI builds the first itinerary draft",
    text: "Turn one destination brief into a day-wise route with stays, pace, food, and practical flow.",
    eyebrow: "Draft faster",
  },
  {
    icon: MapPinned,
    title: "Everything stays connected",
    text: "Maps, budgets, weather, packing, documents, and notes evolve around the same trip.",
    eyebrow: "One workspace",
  },
  {
    icon: Compass,
    title: "Refine without losing clarity",
    text: "Adjust routes, update style, and shape each day while keeping the itinerary usable.",
    eyebrow: "Stay in control",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Tell Wandrly where you want to go",
    text: "Add your destination, dates, travelers, budget, and the style of trip you want.",
  },
  {
    step: "02",
    title: "Let AI shape the itinerary",
    text: "Get a structured plan with route logic, stays, activities, food, and timing.",
  },
  {
    step: "03",
    title: "Refine details in your workspace",
    text: "Adjust pacing, map stops, hotel choices, weather planning, and travel prep in one place.",
  },
  {
    step: "04",
    title: "Manage the full journey beautifully",
    text: "Budgets, packing, documents, journals, and sharing stay attached to the trip.",
  },
];

const trustItems = [
  { label: "Trips organized in one workspace", value: "Route, budget, docs, and prep" },
  { label: "Planning time reduced dramatically", value: "From scattered tabs to one system" },
  { label: "Built for modern travel coordination", value: "AI draft plus real execution tools" },
];

const testimonials = [
  {
    name: "Meera S.",
    role: "Luxury leisure traveler",
    quote:
      "Wandrly feels like having a travel designer and a trip manager in the same calm interface.",
  },
  {
    name: "Julian R.",
    role: "Frequent city-break planner",
    quote:
      "The itinerary starts smart, but what really stands out is how the details stay organized after that.",
  },
];

const plannerChips = ["Romantic", "Adventure", "Family", "Luxury", "Food-led", "Slow travel"];

export default function LandingPageClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  const primaryHref = isLoggedIn ? "/ai-trip-planner" : "/ai-trip-planner";

  return (
    <div className="pb-24 md:pb-0">
      <section className="relative overflow-hidden px-4 pt-6 sm:px-6 lg:px-8">
        <div className="app-shell relative overflow-hidden rounded-[40px] border border-white/45 bg-[#f7f4ef] shadow-[0_30px_90px_rgba(22,40,64,0.12)]">
          <div className="absolute inset-0">
            {heroImages.map((image, index) => (
              <motion.div
                key={image}
                animate={{
                  opacity: activeImage === index ? 1 : 0,
                  scale: activeImage === index ? 1 : 1.04,
                }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,244,238,0.7),rgba(248,244,238,0.78)_30%,rgba(248,244,238,0.96)_72%,#f8f6f2_100%)]" />
            <div className="hero-orb left-[-4%] top-[8%] h-[320px] w-[320px] bg-[rgba(0,194,255,0.24)]" />
            <div className="hero-orb right-[-8%] top-[20%] h-[360px] w-[360px] bg-[rgba(255,204,170,0.34)]" />
            <div className="hero-orb bottom-[-12%] left-[26%] h-[300px] w-[300px] bg-[rgba(114,155,255,0.16)]" />
          </div>

          <div className="relative z-10 px-6 pb-14 pt-16 sm:px-10 lg:px-14 lg:pb-18 lg:pt-20">
            <div className="mx-auto max-w-[1160px]">
              <div className="grid gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="max-w-[560px]"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/58 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#14518b] shadow-[0_10px_28px_rgba(20,81,139,0.08)] backdrop-blur-xl">
                    <Sparkles className="size-3.5" />
                    AI-powered travel planning
                  </div>

                  <h1 className="mt-7 font-[family-name:var(--font-noto-serif)] text-[3.35rem] font-bold leading-[0.9] tracking-[-0.07em] text-[#0f3460] sm:text-[4.55rem] xl:text-[5.8rem]">
                    Plan dream trips with clarity, beauty, and zero chaos.
                  </h1>

                  <p className="mt-6 max-w-2xl text-base leading-8 text-[#566b84] sm:text-lg">
                    Wandrly creates smart itineraries, keeps your route organized, and gives you one
                    elegant place to manage stays, budgets, packing, documents, and trip details.
                  </p>

                  <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <Link href={primaryHref}>
                      <Button className="min-w-[220px] rounded-full px-7 py-6 text-base">
                        Generate My Itinerary
                        <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                    <Link href="/explore">
                      <Button
                        variant="outline"
                        className="min-w-[220px] rounded-full border-white/60 bg-white/72 px-7 py-6 text-base text-[#0f3460] backdrop-blur-xl"
                      >
                        See Demo Trip
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-9 flex flex-wrap items-center gap-4 text-sm text-[#566b84]">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/55 px-4 py-2 backdrop-blur-xl">
                      <Star className="size-4 text-[#ff8b5e]" />
                      Premium planning experience
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/55 px-4 py-2 backdrop-blur-xl">
                      <ShieldCheck className="size-4 text-[#14518b]" />
                      One connected travel workspace
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ duration: 0.86, ease: "easeOut", delay: 0.1 }}
                  className="relative min-h-[420px] lg:min-h-[600px]"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
                    className="glass-shell absolute inset-x-0 top-0 overflow-hidden rounded-[34px] p-4 sm:p-5"
                  >
                    <div className="relative h-[430px] overflow-hidden rounded-[28px] sm:h-[520px]">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage:
                            "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80')",
                        }}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,35,68,0.08),rgba(8,35,68,0.18)_24%,rgba(8,35,68,0.68)_100%)]" />

                      <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-white/18 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/92 backdrop-blur-xl">
                        Featured arrival
                      </div>

                      <div className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-white/22 bg-[rgba(255,255,255,0.16)] p-5 text-white shadow-[0_18px_50px_rgba(12,28,52,0.2)] backdrop-blur-[24px]">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-white/72">
                              Summer coast escape
                            </p>
                            <h2 className="mt-2 font-[family-name:var(--font-noto-serif)] text-[2.2rem] font-bold tracking-[-0.05em] sm:text-[3rem]">
                              Amalfi Coast
                            </h2>
                            <p className="mt-2 max-w-md text-sm leading-7 text-white/84 sm:text-base">
                              A seven-day route with coastal stays, garden lunches, private boat time,
                              and a pace that still feels restful.
                            </p>
                          </div>
                          <div className="rounded-full border border-white/24 bg-white/14 px-4 py-2 text-sm font-medium text-white/88">
                            AI plan ready
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                    className="glass-float absolute left-[-4%] top-[10%] hidden w-[180px] rounded-[24px] p-4 lg:block"
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#61738C]">Duration</p>
                    <p className="mt-2 text-2xl font-semibold text-[#0f3460]">7 days</p>
                    <p className="mt-1 text-sm text-[#61738C]">Balanced pace, coastal luxury</p>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                    className="glass-float absolute right-[-2%] top-[12%] hidden w-[190px] rounded-[24px] p-4 lg:block"
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#61738C]">Budget</p>
                    <p className="mt-2 text-2xl font-semibold text-[#0f3460]">Mid to luxe</p>
                    <p className="mt-1 text-sm text-[#61738C]">Hotels, dining, and transfers aligned</p>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                    className="glass-float absolute bottom-[18%] left-[4%] hidden w-[210px] rounded-[24px] p-4 md:block"
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#61738C]">Travelers</p>
                    <p className="mt-2 text-2xl font-semibold text-[#0f3460]">2 adults</p>
                    <p className="mt-1 text-sm text-[#61738C]">Romantic route with slow mornings</p>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 9, 0] }}
                    transition={{ duration: 6.6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    className="glass-float absolute bottom-[10%] right-[6%] hidden w-[220px] rounded-[24px] p-4 md:block"
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#61738C]">Planning result</p>
                    <p className="mt-2 text-xl font-semibold text-[#0f3460]">Route, stays, budget, and prep</p>
                    <p className="mt-1 text-sm text-[#61738C]">Ready to move into the trip workspace</p>
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.85, ease: "easeOut", delay: 0.12 }}
                className="glass-shell relative mt-12 overflow-hidden rounded-[34px] p-6 sm:p-8"
              >
                <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-[rgba(0,194,255,0.1)] blur-3xl" />
                <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[rgba(255,199,163,0.16)] blur-3xl" />
                <div className="relative">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="section-label text-[#14518b]">Smart trip planner</p>
                      <h2 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.25rem] font-bold tracking-[-0.05em] text-[#0f3460] sm:text-[3.15rem]">
                        Start with a beautiful brief, not a messy form.
                      </h2>
                      <p className="mt-4 text-base leading-8 text-[#61738C]">
                        Give Wandrly the right inputs and get a polished itinerary you can refine,
                        save, and operate across the rest of the product.
                      </p>
                    </div>

                    <div className="inline-flex flex-wrap gap-2">
                      {plannerChips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-white/55 bg-white/58 px-4 py-2 text-sm text-[#14518b] backdrop-blur-xl"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_0.8fr_0.9fr_auto]">
                    {[
                      ["Where to?", "Amalfi Coast, Kyoto, Dubai..."],
                      ["Travel dates", "14 Sep - 20 Sep"],
                      ["Travelers", "2 travelers"],
                      ["Style", "Luxury coast escape"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[24px] border border-white/55 bg-white/56 px-5 py-5 shadow-[0_12px_28px_rgba(20,81,139,0.05)] backdrop-blur-[24px]"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7A8EA8]">
                          {label}
                        </p>
                        <p className="mt-3 text-[15px] font-medium text-[#1f3550]">{value}</p>
                      </div>
                    ))}

                    <Link href="/ai-trip-planner" className="flex">
                      <Button className="h-full w-full rounded-[24px] px-6 text-base">
                        Plan Your Trip
                        <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="app-shell">
          <div className="glass-shell grid gap-5 rounded-[32px] p-6 sm:grid-cols-3 sm:p-7">
            {trustItems.map((item) => (
              <div key={item.label} className="rounded-[22px] border border-white/40 bg-white/42 p-5 backdrop-blur-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#14518b]">
                  Trusted by modern travelers
                </p>
                <h3 className="mt-3 text-lg font-semibold text-[#0f3460]">{item.label}</h3>
                <p className="mt-2 text-sm leading-7 text-[#61738C]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="app-shell grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-shell rounded-[32px] p-7 sm:p-8">
            <p className="section-label text-[#14518b]">Try Wandrly before you sign in</p>
            <h2 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.5rem] font-bold tracking-[-0.05em] text-[#0f3460] sm:text-[3.2rem]">
              See the trip outcome before you commit to the workflow.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#61738C]">
              Explore a sample itinerary, preview how the trip workspace comes together, and see
              the kind of structure Wandrly gives you after one well-written brief.
            </p>
            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <Link href="/explore">
                <Button className="min-w-[220px] rounded-full px-6 py-5">
                  Explore Sample Trips
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/assistant">
                <Button variant="outline" className="min-w-[220px] rounded-full border-white/55 bg-white/66 px-6 py-5">
                  Preview the Assistant
                </Button>
              </Link>
            </div>
          </div>

          <div className="glass-shell rounded-[32px] p-6 sm:p-8">
            <div className="rounded-[28px] border border-white/55 bg-white/58 p-5 backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="section-label text-[#14518b]">Demo trip</p>
                  <h3 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[2rem] font-bold tracking-[-0.04em] text-[#0f3460]">
                    {demoTripPreview.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#61738C]">{demoTripPreview.summary}</p>
                </div>
                <div className="rounded-full border border-white/55 bg-white/72 px-4 py-2 text-sm text-[#14518b]">
                  {demoTripPreview.duration}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {demoTripPreview.days.map((day) => (
                  <div key={day.label} className="rounded-[22px] bg-[#FAF9F7] p-4 shadow-[0_12px_24px_rgba(20,81,139,0.04)]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#14518b]">
                        {day.label}
                      </p>
                      <span className="rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#7A8EA8]">
                        Demo view
                      </span>
                    </div>
                    <h4 className="mt-2 text-lg font-semibold text-[#0f3460]">{day.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-[#61738C]">{day.morning[0]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="app-shell">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-label text-[#14518b]">Why Wandrly works</p>
            <h2 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[2.7rem] font-bold tracking-[-0.05em] text-[#0f3460] sm:text-[3.8rem]">
              Built for travelers who want elegance, not planning friction.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {featureCards.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  className={`glass-shell rounded-[30px] p-7 ${index === 1 ? "lg:translate-y-8" : ""}`}
                >
                  <div className="inline-flex rounded-[18px] border border-white/45 bg-white/58 p-3 text-[#14518b] backdrop-blur-xl">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7A8EA8]">
                    {item.eyebrow}
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-noto-serif)] text-[2rem] font-bold tracking-[-0.04em] text-[#0f3460]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-8 text-[#61738C]">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="app-shell">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="section-label text-[#14518b]">Featured escapes</p>
              <h2 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[2.8rem] font-bold tracking-[-0.05em] text-[#0f3460] sm:text-[3.9rem]">
                Beautiful routes that deserve more than a notes app.
              </h2>
            </div>
            <Link href="/explore" className="inline-flex">
              <Button variant="outline" className="rounded-full border-white/55 bg-white/68">
                Explore sample trips
              </Button>
            </Link>
          </div>

          <div className="mt-14 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-1">
              <DestinationCard {...featuredDestinations[0]} />
              <DestinationCard {...featuredDestinations[3]} />
            </div>
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-1">
              <DestinationCard {...featuredDestinations[1]} />
              <DestinationCard {...featuredDestinations[2]} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="app-shell">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="glass-shell rounded-[34px] p-7 sm:p-8">
              <p className="section-label text-[#14518b]">How it works</p>
              <h2 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.6rem] font-bold tracking-[-0.05em] text-[#0f3460] sm:text-[3.4rem]">
                From travel idea to organized trip workspace.
              </h2>
              <p className="mt-4 text-base leading-8 text-[#61738C]">
                Wandrly is designed to stay clear at every step: brief the trip, let AI build the
                structure, refine the plan, and keep the journey operational in one place.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {workflowSteps.map((step) => (
                <motion.div
                  key={step.step}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  className="glass-shell rounded-[28px] p-6"
                >
                  <div className="inline-flex rounded-full border border-white/55 bg-white/58 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#14518b]">
                    {step.step}
                  </div>
                  <h3 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[1.8rem] font-bold tracking-[-0.04em] text-[#0f3460]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-8 text-[#61738C]">{step.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="app-shell">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="glass-shell rounded-[34px] p-7 sm:p-8">
              <p className="section-label text-[#14518b]">Trip workspace preview</p>
              <h2 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.6rem] font-bold tracking-[-0.05em] text-[#0f3460] sm:text-[3.2rem]">
                The itinerary is only the beginning.
              </h2>
              <div className="mt-7 grid gap-4">
                {[
                  ["Route + map sync", "Destinations become route stops and map context automatically."],
                  ["Travel prep", "Budgets, documents, packing, and weather stay attached to the same trip."],
                  ["Refinement history", "Iterate on the itinerary without losing previous strong versions."],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-[24px] border border-white/55 bg-white/48 p-5 backdrop-blur-xl"
                  >
                    <h3 className="text-lg font-semibold text-[#0f3460]">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#61738C]">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-shell rounded-[34px] p-6 sm:p-8">
              <div className="rounded-[28px] border border-white/55 bg-white/48 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7A8EA8]">
                      Sample itinerary
                    </p>
                    <h3 className="mt-2 font-[family-name:var(--font-noto-serif)] text-[2rem] font-bold tracking-[-0.04em] text-[#0f3460]">
                      Amalfi Coast, 7 days
                    </h3>
                  </div>
                  <div className="rounded-full border border-white/55 bg-white/58 px-4 py-2 text-sm text-[#14518b]">
                    AI generated
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    ["Day 1", "Arrival in Positano", "Hotel check-in, terrace dinner, soft coastal start."],
                    ["Day 2", "Private waters", "Boat route, hidden coves, and a longer afternoon lunch."],
                    ["Day 3", "Garden and village rhythm", "Lemon groves, ceramics, and an easy scenic evening."],
                  ].map(([day, title, text]) => (
                    <div
                      key={day}
                      className="rounded-[22px] border border-white/55 bg-white/62 p-4 shadow-[0_12px_24px_rgba(20,81,139,0.04)]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#14518b]">
                          {day}
                        </p>
                        <div className="inline-flex items-center gap-2 text-sm text-[#61738C]">
                          <Clock3 className="size-4 text-[#14518b]" />
                          Balanced pace
                        </div>
                      </div>
                      <h4 className="mt-2 text-lg font-semibold text-[#0f3460]">{title}</h4>
                      <p className="mt-2 text-sm leading-7 text-[#61738C]">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="app-shell grid gap-6 lg:grid-cols-2">
          {testimonials.map((item) => (
            <div key={item.name} className="glass-shell rounded-[30px] p-7">
              <div className="inline-flex items-center gap-1 text-[#ff8b5e]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 font-[family-name:var(--font-noto-serif)] text-[2rem] font-bold tracking-[-0.04em] text-[#0f3460]">
                “{item.quote}”
              </p>
              <div className="mt-5">
                <p className="text-base font-semibold text-[#0f3460]">{item.name}</p>
                <p className="text-sm text-[#61738C]">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="app-shell overflow-hidden rounded-[38px] border border-white/45 bg-[#0f3460] shadow-[0_30px_90px_rgba(15,52,96,0.22)]">
          <div
            className="relative overflow-hidden px-8 py-16 sm:px-12 lg:px-16 lg:py-20"
            style={{
              backgroundImage:
                "linear-gradient(120deg,rgba(15,52,96,0.9),rgba(15,52,96,0.62)),url('https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1800&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="hero-orb right-[-4%] top-[6%] h-[260px] w-[260px] bg-[rgba(0,194,255,0.22)]" />
            <div className="relative z-10 max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/66">
                Start beautifully
              </p>
              <h2 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[2.9rem] font-bold tracking-[-0.05em] text-white sm:text-[4.2rem]">
                Build the trip, then keep the whole journey under control.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
                Generate your first itinerary in minutes and move straight into the trip workspace
                where routes, stays, budgets, weather, and prep all stay connected.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link href={primaryHref}>
                  <Button className="min-w-[210px] rounded-full bg-white px-7 py-6 text-base text-[#0f3460] shadow-[0_18px_40px_rgba(255,255,255,0.14)] hover:bg-white">
                    Start Planning
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button
                    variant="outline"
                    className="min-w-[210px] rounded-full border-white/32 bg-white/10 px-7 py-6 text-base text-white backdrop-blur-xl hover:bg-white/16"
                  >
                    See sample trips
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
