"use client";

import { Button } from "@/components/ui/button";
import { demoTripPreview } from "@/lib/demo-content";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  MapPinned,
  Mountain,
  ShieldCheck,
  Sparkles,
  Stars,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const heroImages = [
  "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=2200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2200&q=80",
];

const heroCards = [
  {
    title: "Volcanic sunrise trails",
    note: "Route pacing, stay picks, and scenic timing already mapped.",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Slow-road escape",
    note: "Drive days, stop order, and overnight rhythm stay connected.",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Mountain basecamp",
    note: "Weather-aware planning, gear prep, and map context in one place.",
    image:
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80",
  },
];

const proofMetrics = [
  { value: "One brief", label: "becomes a route, itinerary, and prep system" },
  { value: "Guest preview", label: "lets travelers see value before signup" },
  { value: "Live workspace", label: "keeps budgets, docs, packing, and notes together" },
];

const featureGrid = [
  {
    icon: Sparkles,
    title: "AI creates the first polished draft",
    text: "Give Wandrly the trip shape and it returns a structured itinerary with route logic, day flow, stay guidance, and local texture.",
  },
  {
    icon: MapPinned,
    title: "Route review stays editable",
    text: "Refine with AI, review suggested stops, reorder them, set a home base, and confirm the route only when it feels right.",
  },
  {
    icon: ShieldCheck,
    title: "Execution details stay attached",
    text: "Budgets, documents, packing, weather, and journal context stay connected to the same trip instead of living in scattered tools.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Describe the trip in human terms",
    text: "Destination, dates, pace, style, and budget are enough to start.",
  },
  {
    step: "02",
    title: "Review the AI-crafted shape",
    text: "See the itinerary draft, suggested route stops, and overall travel rhythm.",
  },
  {
    step: "03",
    title: "Tune the route and details",
    text: "Refine days, update stops, and only confirm the map when it reflects the real plan.",
  },
  {
    step: "04",
    title: "Run the trip from one workspace",
    text: "Move into budget, packing, documents, collaboration, and sharing without losing context.",
  },
];

const routeEditions = [
  {
    eyebrow: "Romantic",
    title: "Amalfi Coast Summer Route",
    text: "A seven-day coastal trip with cliffside stays, boat time, lemon grove walks, and dinners paced for a relaxed honeymoon feel.",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    meta: "7 days",
    tone: "Soft coast",
  },
  {
    eyebrow: "Adventure",
    title: "Dolomite Ridge Week",
    text: "A mountain-first route with cable cars, alpine lakes, quiet villages, and enough breathing room between big landscape days.",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    meta: "6 days",
    tone: "High altitude",
  },
  {
    eyebrow: "Slow travel",
    title: "Kyoto and Lake Biwa Edit",
    text: "A composed mix of temple mornings, design hotels, tea houses, lake detours, and evenings that never feel overbooked.",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    meta: "8 days",
    tone: "Quiet detail",
  },
];

const heroPreviewMoments = [
  "Route review before you lock stops",
  "Packing, budget, and docs in one trip view",
  "AI refinement without losing structure",
];

export default function LandingPageClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeImage, setActiveImage] = useState(0);
  const primaryHref = "/ai-trip-planner";

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 5400);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="pb-24 md:pb-0">
      <section className="px-2 pt-4 sm:px-4 lg:px-5">
        <div className="landing-shell">
          <div className="relative overflow-hidden rounded-[38px] border border-white/40 bg-[#d8c8ba] shadow-[0_36px_120px_rgba(16,23,37,0.22)]">
            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroImages[activeImage]}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${heroImages[activeImage]})` }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(42,36,44,0.22),rgba(42,36,44,0.28)_24%,rgba(35,28,34,0.46)_62%,rgba(26,19,24,0.72)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,227,192,0.28),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(255,183,125,0.24),transparent_26%),radial-gradient(circle_at_30%_90%,rgba(136,174,222,0.2),transparent_30%)]" />
            </div>

            <div className="pointer-events-none absolute inset-5 rounded-[32px] border border-white/28 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.26)] sm:inset-7" />

            <div className="relative z-10 px-5 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8 lg:px-12 lg:pb-12 xl:px-16">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  {["AI itinerary studio", "Route-first planning", "Real trip prep"].map(
                    (label) => (
                      <span
                        key={label}
                        className="rounded-full border border-white/24 bg-white/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-white/82 backdrop-blur-xl"
                      >
                        {label}
                      </span>
                    )
                  )}
                </div>

                <div className="rounded-full border border-white/24 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/74 backdrop-blur-xl">
                  Plan with confidence
                </div>
              </div>

              <div className="mx-auto mt-10 max-w-[1240px] lg:mt-14 2xl:max-w-[1320px]">
                <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end xl:gap-14">
                  <div className="max-w-[760px]">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/24 bg-white/12 px-4 py-2 text-sm text-white/90 backdrop-blur-xl">
                      <Mountain className="size-4 text-[#ffd39d]" />
                      AI planning shaped for travelers, not spreadsheets
                    </div>

                    <h1 className="mt-6 font-[family-name:var(--font-noto-serif)] text-[3rem] leading-[0.92] tracking-[-0.06em] text-white sm:text-[4.2rem] lg:text-[5.9rem] xl:text-[6.4rem]">
                      Plan travel with atmosphere, structure, and calm control.
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
                      Start with a short brief and turn it into a polished itinerary, confirmed
                      route, and trip-ready workspace with budgets, documents, and packing built
                      in.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link href={primaryHref}>
                        <Button className="min-w-[220px] rounded-full bg-white px-7 py-6 text-base text-[#2c2a31] hover:bg-white">
                          {isLoggedIn ? "Open Planner" : "Start Planning"}
                          <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                      <Link href="/explore">
                        <Button
                          variant="outline"
                          className="min-w-[220px] rounded-full border-white/30 bg-white/10 px-7 py-6 text-base text-white backdrop-blur-xl hover:bg-white/16"
                        >
                          See Demo Trip
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                    <div className="rounded-[28px] border border-white/20 bg-white/12 p-5 text-white shadow-[0_20px_50px_rgba(8,14,28,0.16)] backdrop-blur-[24px]">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.22em] text-white/62">
                            Featured route
                          </p>
                          <h2 className="mt-3 text-[1.65rem] font-semibold tracking-[-0.04em] text-white">
                            {demoTripPreview.title}
                          </h2>
                        </div>
                        <div className="rounded-full border border-white/18 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/76">
                          {demoTripPreview.duration}
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-white/74">
                        {demoTripPreview.summary}
                      </p>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        {demoTripPreview.days.slice(0, 2).map((day) => (
                          <div
                            key={day.label}
                            className="rounded-[20px] border border-white/16 bg-black/12 p-4"
                          >
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/56">
                              {day.label}
                            </p>
                            <p className="mt-2 text-sm font-medium text-white">{day.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 grid gap-4 lg:grid-cols-[0.82fr_1.18fr] xl:gap-5">
                  <div className="rounded-[28px] border border-white/20 bg-white/10 p-5 text-white shadow-[0_20px_50px_rgba(8,14,28,0.16)] backdrop-blur-[24px]">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[0, 1, 2, 3].map((index) => (
                          <div
                            key={index}
                            className="flex size-10 items-center justify-center rounded-full border border-white/16 bg-[linear-gradient(145deg,rgba(255,255,255,0.32),rgba(255,255,255,0.14))] text-sm font-semibold text-white"
                          >
                            {index === 3 ? "50+" : String.fromCharCode(65 + index)}
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">People joined</p>
                        <p className="text-sm text-white/64">
                          Travelers want beauty and operational clarity together.
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 max-w-md text-sm leading-7 text-white/72">
                      Wandrly keeps the planning mood aspirational, but the product stays useful:
                      route review, trip prep, and live travel details all stay connected instead
                      of scattered across tabs.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link href="/assistant">
                        <Button className="rounded-full bg-white/92 px-5 text-[#2b2b31] hover:bg-white">
                          Preview assistant
                        </Button>
                      </Link>
                      <Link href="/explore">
                        <Button
                          variant="outline"
                          className="rounded-full border-white/28 bg-white/8 px-5 text-white hover:bg-white/14"
                        >
                          View sample routes
                        </Button>
                      </Link>
                    </div>

                    <div className="mt-7 grid gap-4 sm:grid-cols-[0.94fr_1.06fr]">
                      <div
                        className="min-h-[180px] overflow-hidden rounded-[24px] border border-white/18 bg-cover bg-center"
                        style={{
                          backgroundImage:
                            "linear-gradient(180deg,rgba(17,24,39,0.06),rgba(17,24,39,0.38)),url('https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=900&q=80')",
                        }}
                      />
                      <div className="rounded-[24px] border border-white/18 bg-black/12 p-4 backdrop-blur-[18px]">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/58">
                          What opens next
                        </p>
                        <div className="mt-4 space-y-3">
                          {heroPreviewMoments.map((moment) => (
                            <div
                              key={moment}
                              className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-white/6 px-3 py-3"
                            >
                              <span className="mt-1 inline-flex size-2.5 rounded-full bg-[#ffd39d]" />
                              <p className="text-sm leading-6 text-white/76">{moment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
                    <motion.div
                      whileHover={{ y: -6 }}
                      transition={{ type: "spring", stiffness: 220, damping: 20 }}
                      className="relative min-h-[320px] overflow-hidden rounded-[30px] border border-white/18 shadow-[0_20px_50px_rgba(8,14,28,0.16)]"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${heroCards[0].image})` }}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,16,27,0.12),rgba(10,16,27,0.2)_38%,rgba(10,16,27,0.64)_100%)]" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                        <div className="inline-flex rounded-full border border-white/22 bg-white/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-xl">
                          Signature escape
                        </div>
                        <p className="mt-4 text-[1.65rem] font-semibold tracking-[-0.04em]">
                          {heroCards[0].title}
                        </p>
                        <p className="mt-2 max-w-lg text-sm leading-7 text-white/72">
                          {heroCards[0].note}
                        </p>
                      </div>
                    </motion.div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                      {heroCards.slice(1).map((card) => (
                        <motion.div
                          key={card.title}
                          whileHover={{ y: -6 }}
                          transition={{ type: "spring", stiffness: 220, damping: 20 }}
                          className="overflow-hidden rounded-[28px] border border-white/18 bg-white/10 shadow-[0_20px_50px_rgba(8,14,28,0.16)] backdrop-blur-[24px]"
                        >
                          <div
                            className="h-[180px] bg-cover bg-center"
                            style={{ backgroundImage: `url(${card.image})` }}
                          />
                          <div className="border-t border-white/14 px-4 py-4 text-white">
                            <p className="text-base font-medium">{card.title}</p>
                            <p className="mt-2 text-sm leading-7 text-white/66">{card.note}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-5 lg:px-6">
        <div className="landing-shell grid gap-5 lg:grid-cols-3">
          {proofMetrics.map((metric, index) => (
            <div
              key={metric.value}
              className={cn(
                "rounded-[28px] border border-white/60 p-6 shadow-[0_18px_40px_rgba(18,23,34,0.06)] backdrop-blur-xl",
                index === 0 && "bg-[linear-gradient(180deg,rgba(255,249,243,0.92),rgba(255,255,255,0.82))]",
                index === 1 && "bg-[linear-gradient(180deg,rgba(246,240,235,0.92),rgba(255,255,255,0.82))]",
                index === 2 && "bg-[linear-gradient(180deg,rgba(241,246,252,0.92),rgba(255,255,255,0.82))]"
              )}
            >
              <p className="font-[family-name:var(--font-noto-serif)] text-[2rem] tracking-[-0.05em] text-[#22324b]">
                {metric.value}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#65758c]">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-5 lg:px-6">
        <div className="landing-shell grid gap-8 lg:grid-cols-[0.98fr_1.02fr]">
          <div className="relative overflow-hidden rounded-[38px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,247,240,0.9),rgba(255,255,255,0.88))] p-7 shadow-[0_20px_50px_rgba(18,23,34,0.08)] sm:p-8">
            <div className="pointer-events-none absolute -right-20 top-0 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(223,171,129,0.18),transparent_68%)] blur-2xl" />
            <p className="section-label text-[#8d5c45]">Why Wandrly works</p>
            <h2 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.5rem] tracking-[-0.05em] text-[#2f2b34] sm:text-[3.4rem]">
              Scenic, warm, and refined without losing product clarity.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#6b6a73]">
              Wandrly is built to turn inspiration into an actual trip plan. The interface stays
              calm and visual, but every decision points back to something useful: itinerary shape,
              route order, travel timing, and the details you need before departure.
            </p>

            <div className="mt-8 grid gap-4">
              {featureGrid.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-white/70 bg-white/74 p-5 shadow-[0_14px_30px_rgba(18,23,34,0.05)]"
                  >
                    <div className="inline-flex rounded-2xl bg-[#f6ece4] p-3 text-[#8d5c45]">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 text-[1.3rem] font-semibold tracking-[-0.03em] text-[#2f2b34]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#6b6a73]">{item.text}</p>
                  </div>
                );
              })}
            </div>

            <div
              className="mt-5 min-h-[220px] overflow-hidden rounded-[28px] border border-white/70 bg-cover bg-center shadow-[0_16px_36px_rgba(18,23,34,0.07)]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg,rgba(255,249,243,0.1),rgba(34,28,33,0.42)),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80')",
              }}
            >
              <div className="flex h-full flex-col justify-end p-5 text-white sm:p-6">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/70">
                  One workspace
                </p>
                <p className="mt-3 max-w-md font-[family-name:var(--font-noto-serif)] text-[1.9rem] tracking-[-0.04em]">
                  From dreamy shortlist to trip-ready plan.
                </p>
                <p className="mt-3 max-w-lg text-sm leading-7 text-white/78">
                  Keep the route, budget, packing list, documents, and collaboration attached to
                  the same trip instead of rebuilding context every time.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2 overflow-hidden rounded-[34px] border border-white/60 bg-[linear-gradient(135deg,rgba(69,58,68,0.96),rgba(133,100,80,0.82))] p-6 text-white shadow-[0_20px_50px_rgba(18,23,34,0.12)] sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/58">
                    Editorial routes
                  </p>
                  <h3 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.6rem] tracking-[-0.05em] sm:text-[3.5rem]">
                    Trips that feel composed before they feel busy.
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-8 text-white/72 sm:text-base">
                    The visual language should suggest premium travel design, not dashboard
                    clutter. We want curation, pacing, and mood before the product details start
                    stacking up.
                  </p>
                </div>

                <div className="grid gap-2 text-[11px] uppercase tracking-[0.22em] text-white/62">
                  {["Scenic hierarchy", "Quiet glass chrome", "Editorial pacing"].map((note) => (
                    <span
                      key={note}
                      className="rounded-full border border-white/18 bg-white/8 px-4 py-2 text-center backdrop-blur-xl"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {routeEditions.map((route, index) => (
              <motion.article
                key={route.title}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className={cn(
                  "overflow-hidden rounded-[30px] border border-white/60 bg-white/82 shadow-[0_18px_40px_rgba(18,23,34,0.08)]",
                  index === 2 && "md:col-span-2 md:grid md:grid-cols-[0.92fr_1.08fr]"
                )}
              >
                <div
                  className={cn(
                    "h-[220px] bg-cover bg-center",
                    index === 2 && "md:h-full md:min-h-[100%]"
                  )}
                  style={{ backgroundImage: `url(${route.image})` }}
                />
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#9f6848]">
                      {route.eyebrow}
                    </p>
                    <span className="rounded-full border border-[#eadacd] bg-[#fff6ee] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#8d5c45]">
                      {route.meta}
                    </span>
                  </div>

                  <h3 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2rem] tracking-[-0.045em] text-[#243453]">
                    {route.title}
                  </h3>
                  <p className="mt-4 text-sm leading-8 text-[#667285]">{route.text}</p>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#efe4da] pt-4">
                    <span className="text-sm text-[#8d5c45]">{route.tone}</span>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-[#243453]">
                      Route study
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-5 lg:px-6">
        <div className="landing-shell rounded-[34px] border border-white/60 bg-white/74 p-7 shadow-[0_20px_50px_rgba(18,23,34,0.08)] sm:p-9">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="section-label text-[#8d5c45]">Product flow</p>
              <h2 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.4rem] tracking-[-0.05em] text-[#2f2b34] sm:text-[3.2rem]">
                The landing page should lead into one clean journey.
              </h2>
            </div>
            <div className="rounded-full border border-[#e5d5c8] bg-[#fff7f0] px-4 py-2 text-sm text-[#8d5c45]">
              Brief to itinerary to route to prep
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {workflow.map((step) => (
              <div
                key={step.step}
                className="rounded-[24px] border border-white/70 bg-[#fffdfa] p-5 shadow-[0_10px_24px_rgba(18,23,34,0.04)]"
              >
                <div className="inline-flex rounded-full border border-[#eadacd] bg-[#fff3ea] px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-[#8d5c45]">
                  {step.step}
                </div>
                <h3 className="mt-4 text-[1.25rem] font-semibold tracking-[-0.03em] text-[#2f2b34]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#6b6a73]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-5 lg:px-6">
        <div className="landing-shell overflow-hidden rounded-[38px] border border-white/30 bg-[#2d2a31] shadow-[0_32px_120px_rgba(16,18,28,0.2)]">
          <div
            className="relative px-7 py-14 sm:px-10 lg:px-14 lg:py-18"
            style={{
              backgroundImage:
                "linear-gradient(120deg,rgba(31,28,36,0.88),rgba(89,62,50,0.52)),url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80')",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,221,188,0.18),transparent_28%)]" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/54">
                  From first draft to departure
                </p>
                <h2 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[2.8rem] tracking-[-0.05em] text-white sm:text-[4rem]">
                  A beautiful trip idea is only useful when the plan holds together.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/74">
                  Wander from inspiration into action with one connected flow: create the first
                  draft, shape the route, then manage the real trip details without leaving the
                  workspace.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Link href={primaryHref}>
                  <Button className="w-full rounded-full bg-white px-7 py-6 text-base text-[#2d2a31] hover:bg-white">
                    Continue to planner
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-white/28 bg-white/10 px-7 py-6 text-base text-white backdrop-blur-xl hover:bg-white/16"
                  >
                    Review sample routes
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative z-10 mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Stars,
                  title: "Editorial hero direction",
                  text: "Large scenic imagery with restrained interface chrome.",
                },
                {
                  icon: UsersRound,
                  title: "Product-led beneath the mood",
                  text: "The hero sells the feeling, but the sections explain the workflow clearly.",
                },
                {
                  icon: Compass,
                  title: "Responsive by design",
                  text: "Hero cards collapse cleanly, text scales intentionally, and CTAs stay obvious.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-white/18 bg-white/10 p-5 backdrop-blur-[18px]"
                  >
                    <div className="inline-flex rounded-2xl bg-white/12 p-3 text-[#ffd39d]">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/68">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
