"use client";

import DestinationCard from "@/components/destination-card";
import GlassWidget from "@/components/ui/glass-widget";
import { Button } from "@/components/ui/button";
import AuthButton from "@/components/auth-button";
import { motion } from "framer-motion";
import {
  CirclePlay,
  Compass,
  Globe2,
  MapPinned,
  Sparkles,
  Stars,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
    budget: "₹65k avg",
    season: "Oct - Nov",
    image:
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Bali",
    country: "Indonesia",
    budget: "₹52k avg",
    season: "Apr - Jun",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Dubai",
    country: "UAE",
    budget: "₹88k avg",
    season: "Nov - Feb",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Santorini",
    country: "Greece",
    budget: "₹92k avg",
    season: "May - Sep",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
  },
];

const testimonials = [
  {
    name: "Aarav Mehta",
    destination: "Japan",
    quote:
      "The itinerary felt like something a concierge would build. It cut planning time from days to minutes.",
  },
  {
    name: "Sana Kapoor",
    destination: "Bali",
    quote:
      "The mix of maps, hotel suggestions, and realistic pacing made the whole trip feel effortless.",
  },
  {
    name: "Rohan Verma",
    destination: "Dubai",
    quote:
      "It looks polished enough for clients, but still gives me freedom to tweak every detail of the route.",
  },
];

export default function LandingPageClient({
  isLoggedIn,
}: {
  isLoggedIn: boolean;
}) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const stats = useMemo(
    () => [
      { value: "2,400+", label: "travelers inspired" },
      { value: "4.9/5", label: "average satisfaction" },
      { value: "120+", label: "destinations explored" },
    ],
    []
  );

  return (
    <div className="pb-28 md:pb-0">
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <motion.div
              key={image}
              animate={{ opacity: activeImage === index ? 1 : 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,14,0.28)_0%,rgba(8,9,14,0.74)_60%,#08090E_100%)]" />
        </div>

        <div className="app-shell relative z-10 flex min-h-[100svh] flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#D8E2F1]"
            >
              <Sparkles className="size-4 text-[#00C2FF]" />
              Final-year project by Rishu Raj · designed like a funded travel startup
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
              className="mt-8 max-w-4xl text-balance text-[42px] font-bold leading-[0.95] tracking-[-0.05em] text-white sm:text-[56px] lg:text-[72px]"
            >
              Plan your perfect trip
              <br />
              in seconds, with{" "}
              <span className="text-[#00C2FF] drop-shadow-[0_0_18px_rgba(0,194,255,0.45)]">
                AI
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.16 }}
              className="mt-6 max-w-xl text-base leading-8 text-[#D8E2F1] sm:text-lg"
            >
              Build complete day-wise itineraries, hotel suggestions, destination routes,
              and travel memories in one deeply polished workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.24 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <AuthButton
                isLoggedIn={isLoggedIn}
                className="inline-flex items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#1B3A6B,#00C2FF)] px-6 py-3.5 text-base font-medium text-white shadow-[0_0_24px_rgba(0,194,255,0.24)] transition hover:brightness-110"
              >
                Start Planning Free →
              </AuthButton>
              <button className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-6 py-3.5 text-base font-medium text-white transition hover:bg-white/8">
                <CirclePlay className="size-5 text-[#00C2FF]" />
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.32 }}
              className="mt-10 max-w-4xl"
            >
              <GlassWidget className="p-4">
                <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_0.8fr_auto]">
                  {["Where to?", "When?", "How many?"].map((label) => (
                    <div
                      key={label}
                      className="rounded-[14px] border border-white/8 bg-black/10 px-4 py-3 text-sm text-[#8B9BB4]"
                    >
                      {label}
                    </div>
                  ))}
                  <Link href="/ai-trip-planner">
                    <Button className="h-full w-full">Generate Itinerary →</Button>
                  </Link>
                </div>
              </GlassWidget>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.4 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4 text-sm text-[#D8E2F1]">
                <div className="flex items-center gap-2">
                  <span>Trusted by 2,400+ travelers</span>
                </div>
                <div className="flex items-center gap-2 text-[#FFD166]">
                  <Stars className="size-4 fill-current" />
                  <span className="text-white">4.9</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs font-medium text-white first:ml-0"
                  >
                    {i}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="app-shell space-y-28 px-4 pt-16 sm:px-6 lg:px-8">
        <section>
          <p className="section-label">WHAT WE DO</p>
          <h2 className="mt-4 max-w-3xl text-[36px] font-semibold tracking-[-0.04em] text-white sm:text-[48px]">
            Everything you need to plan the perfect trip
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: <Sparkles className="size-6" />,
                title: "AI Itinerary Generation",
                text: "Generate complete day-wise trip plans with hotels, foods, routes, and alternatives.",
              },
              {
                icon: <MapPinned className="size-6" />,
                title: "Interactive Maps",
                text: "See every destination on a dark route map with spatial context and quick edits.",
              },
              {
                icon: <Globe2 className="size-6" />,
                title: "3D Travel Globe",
                text: "Turn your travel history into a cinematic memory layer with a global footprint view.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.32, delay: index * 0.08 }}
                className="rounded-[24px] border border-white/8 bg-[#0F1117] p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_24px_rgba(0,0,0,0.4)]"
              >
                <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-[#00C2FF]">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#8B9BB4]">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="section-label">HOW IT WORKS</p>
            <h2 className="mt-4 text-[36px] font-semibold tracking-[-0.04em] text-white sm:text-[48px]">
              Simple flow, premium result.
            </h2>
          </div>
          <div className="space-y-6">
            {[
              ["01", "Tell us your dream destination", "Choose the city, dates, style, budget, and the kind of trip you want."],
              ["02", "AI builds your perfect itinerary", "Get a polished trip structure with hotels, attractions, food, and daily pacing."],
              ["03", "Explore, edit and travel", "Reorder stops, open maps, save locations, and carry your trip from plan to execution."],
            ].map(([num, title, text], index) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.32, delay: index * 0.08 }}
                className="relative overflow-hidden rounded-[24px] border border-white/8 bg-[#0F1117] p-6"
              >
                <div className="absolute right-6 top-4 text-[72px] font-semibold tracking-[-0.08em] text-white/4">
                  {num}
                </div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#00C2FF]">
                  Step {num}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#8B9BB4]">{text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-label">DESTINATION SHOWCASE</p>
              <h2 className="mt-4 text-[36px] font-semibold tracking-[-0.04em] text-white sm:text-[48px]">
                Places that deserve better planning
              </h2>
            </div>
          </div>
          <div className="mt-10 flex gap-5 overflow-x-auto pb-4">
            {destinations.map((destination) => (
              <DestinationCard key={destination.title} {...destination} />
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/8 bg-[#0F1117] p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-label">TESTIMONIALS</p>
              <h2 className="mt-4 text-[36px] font-semibold tracking-[-0.04em] text-white sm:text-[48px]">
                Travel planning that feels calm, not cluttered
              </h2>
            </div>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.32, delay: index * 0.08 }}
                className="rounded-[24px] border border-white/8 bg-white/[0.03] p-6"
              >
                <div className="mb-4 flex items-center gap-1 text-[#FFD166]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Stars key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-7 text-[#D8E2F1]">“{testimonial.quote}”</p>
                <div className="mt-6">
                  <p className="font-medium text-white">{testimonial.name}</p>
                  <p className="text-sm text-[#8B9BB4]">{testimonial.destination}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/8 bg-[linear-gradient(135deg,#1B3A6B,#00C2FF)] px-8 py-10 shadow-[0_0_30px_rgba(0,194,255,0.18)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/70">
                One last step
              </p>
              <h2 className="mt-3 max-w-2xl text-[36px] font-semibold tracking-[-0.04em] text-white sm:text-[48px]">
                Your next adventure is one prompt away.
              </h2>
            </div>
            <AuthButton
              isLoggedIn={isLoggedIn}
              className="inline-flex items-center justify-center rounded-[10px] bg-[#08090E] px-6 py-3.5 text-base font-medium text-white transition hover:brightness-110"
            >
              Get Started Free
            </AuthButton>
          </div>
        </section>
      </main>
    </div>
  );
}
