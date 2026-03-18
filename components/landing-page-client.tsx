"use client";

import AuthButton from "@/components/auth-button";
import DestinationCard from "@/components/destination-card";
import GlassWidget from "@/components/ui/glass-widget";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CirclePlay,
  Compass,
  Globe2,
  MapPinned,
  PlaneTakeoff,
  Sparkles,
  Stars,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const heroImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1526481280695-3c4693f11f25?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1800&q=80",
];

const destinations = [
  {
    title: "Kyoto",
    country: "Japan",
    budget: "INR 65k avg",
    season: "Oct to Nov",
    image:
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Bali",
    country: "Indonesia",
    budget: "INR 52k avg",
    season: "Apr to Jun",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Dubai",
    country: "UAE",
    budget: "INR 88k avg",
    season: "Nov to Feb",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Santorini",
    country: "Greece",
    budget: "INR 92k avg",
    season: "May to Sep",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
  },
];

const testimonials = [
  {
    name: "Aarav Mehta",
    destination: "Japan creative retreat",
    quote:
      "The product feels closer to a premium concierge platform than a typical planner. It immediately earns trust.",
  },
  {
    name: "Sana Kapoor",
    destination: "Bali couple escape",
    quote:
      "The atmosphere is what surprised me first. Planning stopped feeling like admin and started feeling like anticipation.",
  },
  {
    name: "Rohan Verma",
    destination: "Dubai business sprint",
    quote:
      "The itinerary, maps, and budget flow feel polished enough to show to clients without apologizing for anything.",
  },
];

const featureCards = [
  {
    icon: <Sparkles className="size-6" />,
    title: "AI trip architecture",
    text: "Generate day-wise plans with pacing, alternatives, hotels, foods, and local travel guidance in seconds.",
  },
  {
    icon: <MapPinned className="size-6" />,
    title: "Maps that stay useful",
    text: "Visualize routes, stops, weather context, notes, and packing details in the same trip workspace.",
  },
  {
    icon: <Globe2 className="size-6" />,
    title: "Memories with depth",
    text: "Turn completed journeys into a living archive with journals, photos, and a cinematic travel footprint.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Shape the trip brief",
    text: "Choose destination, dates, budget, style, and the mood you want the trip to carry.",
  },
  {
    number: "02",
    title: "Let AI draft the route",
    text: "Get a structured travel plan with day splits, hotel suggestions, food ideas, and alternatives.",
  },
  {
    number: "03",
    title: "Refine it into your version",
    text: "Adjust stops, track budget, add documents, notes, weather, and make the trip operational.",
  },
];

export default function LandingPageClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="pb-28 md:pb-0">
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="hero-orb left-[-8%] top-[12%] h-[260px] w-[260px] bg-[#00C2FF]/35" />
        <div className="hero-orb right-[-5%] top-[18%] h-[320px] w-[320px] bg-[#1B3A6B]/55" />
        <div className="hero-orb bottom-[6%] left-[42%] h-[240px] w-[240px] bg-[#FF6B35]/18" />

        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <motion.div
              key={image}
              animate={{ opacity: activeImage === index ? 1 : 0, scale: activeImage === index ? 1 : 1.03 }}
              transition={{ duration: 1.3, ease: "easeOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,15,0.18),rgba(4,8,15,0.52)_36%,rgba(4,8,15,0.86)_72%,#070B12_100%)]" />
        </div>

        <div className="app-shell relative z-10 flex min-h-[100svh] items-center px-4 pb-18 pt-24 sm:px-6 lg:px-8">
          <div className="grid w-full gap-12 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-[#E6EEF8] backdrop-blur-xl"
              >
                <Sparkles className="size-4 text-[#00C2FF]" />
                Built for immersive trip planning, not generic itinerary forms
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
                className="mt-8 max-w-5xl text-balance text-[46px] font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-[62px] lg:text-[84px]"
              >
                Travel planning that feels
                <span className="block bg-[linear-gradient(90deg,#F8FBFF,#85DDFF,#F8FBFF)] bg-clip-text text-transparent">
                  cinematic, intelligent, and ready to book.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
                className="mt-6 max-w-2xl text-[16px] leading-8 text-[#C4D0E2] sm:text-lg"
              >
                Voya combines AI itineraries, route maps, budgets, packing, documents, and
                journals into one premium travel workspace designed to feel calm, decisive, and
                aspirational.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.24 }}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <AuthButton
                  isLoggedIn={isLoggedIn}
                  className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#1B3A6B,#00C2FF)] px-7 py-4 text-base font-medium text-white shadow-[0_0_30px_rgba(0,194,255,0.22)] transition hover:brightness-110"
                >
                  Start planning free
                  <ArrowRight className="size-4" />
                </AuthButton>
                <button className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-white/12 bg-white/8 px-7 py-4 text-base font-medium text-white backdrop-blur-xl transition hover:bg-white/12">
                  <CirclePlay className="size-5 text-[#00C2FF]" />
                  Watch demo
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.32 }}
                className="mt-10"
              >
                <GlassWidget className="rounded-[30px] border-white/12 p-4">
                  <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_0.8fr_auto]">
                    {[
                      { label: "Where to", value: "Kyoto, Japan" },
                      { label: "Travel window", value: "12 Oct to 18 Oct" },
                      { label: "Travelers", value: "2 adults" },
                    ].map((field) => (
                      <div
                        key={field.label}
                        className="rounded-[18px] border border-white/10 bg-black/15 px-4 py-3.5 backdrop-blur-xl"
                      >
                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#89A0BF]">
                          {field.label}
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">{field.value}</p>
                      </div>
                    ))}
                    <Link href="/ai-trip-planner">
                      <Button className="h-full w-full rounded-[18px] px-5 text-sm">
                        Generate itinerary
                      </Button>
                    </Link>
                  </div>
                </GlassWidget>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
                className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#D8E2F1]">
                  <span>Trusted by 2,400+ travelers</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5">
                    <Stars className="size-4 fill-current text-[#FFD166]" />
                    <span className="text-white">4.9 average rating</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs font-medium text-white first:ml-0"
                    >
                      T{i}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.12 }}
              className="hidden xl:block"
            >
              <div className="relative mx-auto max-w-[520px]">
                <div className="premium-card relative overflow-hidden rounded-[34px] p-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,194,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(27,58,107,0.18),transparent_26%)]" />
                  <div className="relative rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#8FA0BC]">
                          Featured journey
                        </p>
                        <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-white">
                          Kyoto Autumn Circuit
                        </h3>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/8 p-3 text-[#00C2FF]">
                        <PlaneTakeoff className="size-5" />
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {[
                        ["Duration", "6 days"],
                        ["Budget", "Mid-range"],
                        ["Style", "Culture + food"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3"
                        >
                          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8397B2]">
                            {label}
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-3">
                      {[
                        {
                          day: "Day 1",
                          title: "Arrival and Gion immersion",
                          tone: "Lantern streets, tea houses, easy pacing",
                        },
                        {
                          day: "Day 2",
                          title: "Temples and philosophy walk",
                          tone: "Golden Pavilion, gardens, evening kaiseki",
                        },
                        {
                          day: "Day 3",
                          title: "Arashiyama and riverside slow time",
                          tone: "Bamboo grove, scenic rail, hidden cafes",
                        },
                      ].map((item, index) => (
                        <div
                          key={item.day}
                          className="rounded-[20px] border border-white/10 bg-[#0A111D]/70 px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.22em] text-[#00C2FF]">
                                {item.day}
                              </p>
                              <h4 className="mt-2 text-base font-semibold text-white">
                                {item.title}
                              </h4>
                              <p className="mt-2 text-sm leading-7 text-[#8FA0BC]">
                                {item.tone}
                              </p>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-white/80">
                              0{index + 1}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-14 w-[240px] rounded-[28px] border border-white/10 bg-[rgba(8,14,24,0.82)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#8FA0BC]">
                    Travel command center
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/6 p-2.5 text-[#00C2FF]">
                        <WalletCards className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Budget tracking</p>
                        <p className="text-xs text-[#8FA0BC]">Stay aligned with trip style</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/6 p-2.5 text-[#00C2FF]">
                        <Compass className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Route intelligence</p>
                        <p className="text-xs text-[#8FA0BC]">Maps, weather, and notes in sync</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="app-shell space-y-28 px-4 pt-16 sm:px-6 lg:px-8">
        <section className="grid gap-5 md:grid-cols-3">
          {[
            ["2,400+", "Trips shaped with AI direction"],
            ["4.9/5", "Average satisfaction score"],
            ["120+", "Destinations explored in planning flows"],
          ].map(([value, label], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.34, delay: index * 0.08 }}
              className="premium-card rounded-[28px] p-6"
            >
              <p className="text-[42px] font-semibold tracking-[-0.05em] text-white">{value}</p>
              <p className="mt-2 text-sm leading-7 text-[#8FA0BC]">{label}</p>
            </motion.div>
          ))}
        </section>

        <section>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-label">What Voya Does</p>
              <h2 className="mt-4 max-w-3xl text-[38px] font-semibold tracking-[-0.05em] text-white sm:text-[54px]">
                A travel workspace designed to feel expensive before you ever book.
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-8 text-[#8FA0BC]">
              Every major planning surface is connected: itinerary, budget, weather, notes,
              documents, packing, and journaling all reinforce the same trip.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {featureCards.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.34, delay: index * 0.08 }}
                className="premium-card rounded-[30px] p-7"
              >
                <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/8 p-3 text-[#00C2FF]">
                  {feature.icon}
                </div>
                <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-white">
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm leading-8 text-[#8FA0BC]">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="premium-card rounded-[34px] p-8">
            <p className="section-label">How It Works</p>
            <h2 className="mt-4 text-[38px] font-semibold tracking-[-0.05em] text-white sm:text-[52px]">
              Elegant input. Operational output.
            </h2>
            <p className="mt-5 text-sm leading-8 text-[#8FA0BC]">
              The experience stays simple at the surface, but the output is structured enough to
              carry a trip from idea to execution.
            </p>
          </div>

          <div className="space-y-5">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.34, delay: index * 0.08 }}
                className="premium-card relative overflow-hidden rounded-[30px] p-7"
              >
                <div className="absolute right-6 top-4 text-[72px] font-semibold tracking-[-0.08em] text-white/5">
                  {step.number}
                </div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#00C2FF]">
                  Step {step.number}
                </p>
                <h3 className="mt-3 text-[28px] font-semibold tracking-[-0.04em] text-white">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-8 text-[#8FA0BC]">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-label">Destination Showcase</p>
              <h2 className="mt-4 text-[38px] font-semibold tracking-[-0.05em] text-white sm:text-[54px]">
                Trips people actually want to screenshot.
              </h2>
            </div>
            <Link href="/ai-trip-planner" className="text-sm text-[#8FA0BC] transition hover:text-white">
              Explore planner flow
            </Link>
          </div>
          <div className="mt-10 flex gap-6 overflow-x-auto pb-4">
            {destinations.map((destination) => (
              <DestinationCard key={destination.title} {...destination} />
            ))}
          </div>
        </section>

        <section className="premium-card rounded-[36px] p-8 sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-label">Social Proof</p>
              <h2 className="mt-4 max-w-3xl text-[38px] font-semibold tracking-[-0.05em] text-white sm:text-[54px]">
                Strong visual trust matters when the product is about expensive decisions.
              </h2>
            </div>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.34, delay: index * 0.08 }}
                className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="mb-5 flex items-center gap-1 text-[#FFD166]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Stars key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-8 text-[#D6E2F1]">"{testimonial.quote}"</p>
                <div className="mt-6">
                  <p className="font-medium text-white">{testimonial.name}</p>
                  <p className="text-sm text-[#8FA0BC]">{testimonial.destination}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(135deg,#0B1530,#163D78_42%,#00C2FF)] px-8 py-10 shadow-[0_0_40px_rgba(0,194,255,0.18)] sm:px-10 sm:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_20%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/72">Ready to launch</p>
              <h2 className="mt-3 max-w-3xl text-[40px] font-semibold tracking-[-0.05em] text-white sm:text-[56px]">
                Make the first impression feel like a premium travel company, not a tool.
              </h2>
            </div>
            <AuthButton
              isLoggedIn={isLoggedIn}
              className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#050A12] px-7 py-4 text-base font-medium text-white transition hover:brightness-110"
            >
              Enter Voya
              <ArrowRight className="size-4" />
            </AuthButton>
          </div>
        </section>
      </main>
    </div>
  );
}
