"use client";

import AuthButton from "@/components/auth-button";
import DestinationCard from "@/components/destination-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CirclePlay,
  Compass,
  MapPinned,
  Sparkles,
  Stars,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const heroImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=2000&q=80",
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
];

const featureCards = [
  {
    icon: <Sparkles className="size-5" />,
    title: "AI drafts the first strong route",
    text: "Destination, hotel zone, pacing, food, and realistic daily structure in one pass.",
  },
  {
    icon: <MapPinned className="size-5" />,
    title: "One system for the full journey",
    text: "Your itinerary, maps, weather, packing, documents, and journals stay connected.",
  },
  {
    icon: <WalletCards className="size-5" />,
    title: "Planning becomes operational",
    text: "After the first draft, the trip keeps improving through route shaping and prep tools.",
  },
];

const introMoments = [
  {
    eyebrow: "Orbital feed",
    title: "Scanning the horizon.",
    description: "Locking weather bands, route signals, and destination mood.",
  },
  {
    eyebrow: "Route engine",
    title: "Charting a cinematic arrival.",
    description: "Pacing the days, shaping the route, and framing the first reveal.",
  },
  {
    eyebrow: "Wandrly",
    title: "Welcome to the next journey.",
    description: "Your travel workspace is ready to open like a story, not a spreadsheet.",
  },
];

export default function LandingPageClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeImage, setActiveImage] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [introStage, setIntroStage] = useState(0);
  const currentHeroImage = heroImages[activeImage];

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("wandrly-intro-seen") === "1") {
      setShowIntro(false);
      return;
    }

    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 5200);

    const stageOne = window.setTimeout(() => setIntroStage(1), 1800);
    const stageTwo = window.setTimeout(() => setIntroStage(2), 3900);
    const introTimeout = window.setTimeout(() => {
      setShowIntro(false);
      sessionStorage.setItem("wandrly-intro-seen", "1");
    }, 6800);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(stageOne);
      window.clearTimeout(stageTwo);
      window.clearTimeout(introTimeout);
    };
  }, []);

  function dismissIntro() {
    setShowIntro(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("wandrly-intro-seen", "1");
    }
  }

  return (
    <div className="pb-28 md:pb-0">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{
          opacity: showIntro ? 1 : 0,
          pointerEvents: showIntro ? "auto" : "none",
        }}
        transition={{ duration: 1.25, ease: "easeOut" }}
        className="fixed inset-0 z-[140] overflow-hidden bg-[radial-gradient(circle_at_center,#103669_0%,#091525_40%,#04070e_100%)]"
      >
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: introStage === 2 ? 1 : 1.12,
              opacity: introStage === 2 ? 0.5 : 0.18,
              filter: introStage === 2 ? "blur(0px)" : "blur(10px)",
            }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentHeroImage})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,12,23,0.72),rgba(5,12,23,0.52)_42%,rgba(5,12,23,0.88)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(157,216,255,0.08),transparent_28%)]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 h-[70vw] w-[70vw] max-h-[900px] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/6"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 h-[54vw] w-[54vw] max-h-[680px] max-w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#9dd8ff]/10"
          />
          <motion.div
            animate={{ scale: [0.92, 1.04, 0.96], opacity: [0.22, 0.38, 0.24] }}
            transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/2 h-[34vw] w-[34vw] max-h-[420px] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,194,255,0.28),rgba(0,194,255,0.02)_58%,transparent_72%)]"
          />
          <motion.div
            animate={{ x: ["-12%", "10%", "-12%"] }}
            transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[12%] top-[24%] h-[1px] w-[76%] bg-[linear-gradient(90deg,transparent,rgba(157,216,255,0.75),transparent)]"
          />
          <motion.div
            animate={{ y: ["-10%", "14%", "-10%"] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[50%] top-[14%] h-[72%] w-[1px] bg-[linear-gradient(180deg,transparent,rgba(157,216,255,0.45),transparent)]"
          />
          {Array.from({ length: 18 }).map((_, index) => (
            <motion.span
              key={index}
              animate={{ opacity: [0.18, 0.84, 0.18] }}
              transition={{
                duration: 2.4 + (index % 4) * 0.35,
                repeat: Infinity,
                delay: index * 0.08,
                ease: "easeInOut",
              }}
              className="absolute rounded-full bg-white"
              style={{
                top: `${8 + ((index * 11) % 74)}%`,
                left: `${6 + ((index * 13) % 84)}%`,
                width: `${index % 3 === 0 ? 3 : 2}px`,
                height: `${index % 3 === 0 ? 3 : 2}px`,
              }}
            />
          ))}
          <div className="absolute left-6 top-6 text-[10px] uppercase tracking-[0.34em] text-white/42 sm:left-10 sm:top-10">
            43.4674 N / 11.8853 E
          </div>
          <div className="absolute right-6 top-6 text-[10px] uppercase tracking-[0.34em] text-white/42 sm:right-10 sm:top-10">
            Orbital descent sequence
          </div>
          <div className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.34em] text-white/42 sm:bottom-10 sm:left-10">
            Sky lock / route acquisition / hero reveal
          </div>
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
          <div className="w-full max-w-5xl">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={dismissIntro}
                className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/72 backdrop-blur-xl transition hover:bg-white/10"
              >
                Skip intro
              </button>
            </div>

            <div className="mt-6 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.05, ease: "easeOut" }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#9dd8ff] backdrop-blur-xl">
                  <Stars className="size-3.5" />
                  Wandrly cinematic launch
                </div>
                <div className="space-y-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-white/50">
                    {introMoments[introStage].eyebrow}
                  </p>
                  <h1 className="font-[family-name:var(--font-noto-serif)] text-[3rem] font-bold leading-[0.88] tracking-[-0.08em] text-white sm:text-[4.8rem]">
                    {introMoments[introStage].title}
                  </h1>
                  <p className="max-w-xl text-base leading-8 text-white/72">
                    {introMoments[introStage].description}
                  </p>
                </div>
                <div className="h-[2px] w-full max-w-[340px] overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 5.8, ease: "easeInOut" }}
                    className="h-full bg-[linear-gradient(90deg,#00C2FF,#ffffff)]"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.15, ease: "easeOut", delay: 0.25 }}
                className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(157,216,255,0.24),transparent_34%)]" />
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.32em] text-white/48">
                        Mission state
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">Destination lock acquired</p>
                    </div>
                    <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[#9dd8ff]">
                      Stage {introStage + 1} / 3
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["Target", "Mediterranean horizon"],
                      ["Mode", "Concierge route engine"],
                      ["Reveal", "Premium travel workspace"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[20px] border border-white/10 bg-black/16 p-4">
                        <p className="text-[10px] uppercase tracking-[0.26em] text-white/42">{label}</p>
                        <p className="mt-2 text-sm leading-7 text-white/82">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="relative h-[220px] overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(0,194,255,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.06))]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                      className="absolute left-1/2 top-1/2 h-[128px] w-[128px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#9dd8ff]/24"
                    />
                    <motion.div
                      animate={{ x: ["-30%", "44%", "-30%"], y: ["-18%", "28%", "-18%"] }}
                      transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute left-[26%] top-[38%] h-3 w-3 rounded-full bg-[#9dd8ff] shadow-[0_0_28px_rgba(157,216,255,0.95)]"
                    />
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none">
                      <motion.path
                        d="M18 68C28 58 34 40 52 38C68 36 70 62 84 50"
                        stroke="url(#routeLine)"
                        strokeWidth="1.4"
                        strokeDasharray="2 3"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 2.6, ease: "easeOut", delay: 0.7 }}
                      />
                      <defs>
                        <linearGradient id="routeLine" x1="18" y1="68" x2="84" y2="50" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#00C2FF" />
                          <stop offset="1" stopColor="#FFFFFF" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/18 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/60">
                      Orbital view
                    </div>
                    <div className="absolute bottom-5 right-5 rounded-full border border-white/10 bg-black/18 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#9dd8ff]">
                      Hero reveal armed
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <section className="relative overflow-hidden px-4 pt-8 sm:px-6 lg:px-8">
        <motion.div
          initial={false}
          animate={{
            opacity: showIntro ? 0.55 : 1,
            scale: showIntro ? 1.02 : 1,
            y: showIntro ? 36 : 0,
            filter: showIntro ? "blur(8px)" : "blur(0px)",
          }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="app-shell relative overflow-hidden rounded-[44px] border border-[rgba(2,71,133,0.08)] bg-[#ece3d7] shadow-[0_36px_90px_rgba(26,28,27,0.12)]"
        >
          <div className="absolute inset-0">
            {heroImages.map((image, index) => (
              <motion.div
                key={image}
                animate={{
                  opacity: activeImage === index ? 1 : 0,
                  scale: activeImage === index ? 1 : 1.04,
                }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,241,234,0.18),rgba(247,241,234,0.5)_24%,rgba(247,241,234,0.88)_58%,#faf9f7_100%)]" />
            <div className="hero-orb left-[-6%] top-[6%] h-[280px] w-[280px] bg-[#83d4ff]" />
            <div className="hero-orb right-[-10%] top-[12%] h-[320px] w-[320px] bg-[#f2c39f]" />
          </div>

          <div className="relative z-10 px-6 pb-12 pt-16 sm:px-10 lg:px-14 lg:pb-18 lg:pt-20">
            <div className="mx-auto max-w-[1080px]">
              <motion.div
                initial={false}
                animate={{
                  opacity: showIntro ? 0.35 : 1,
                  y: showIntro ? 40 : 0,
                }}
                transition={{ duration: 1.25, delay: showIntro ? 0 : 0.18 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/78 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#024785] shadow-[0_12px_28px_rgba(26,28,27,0.06)] backdrop-blur-xl">
                  <Stars className="size-3.5" />
                  Signature travel intelligence
                </div>

                <h1 className="mt-8 font-[family-name:var(--font-noto-serif)] text-[3.7rem] font-bold leading-[0.86] tracking-[-0.08em] text-[#024785] sm:text-[5.4rem] lg:text-[7.3rem]">
                  Begin like a mission.
                  <br />
                  Travel like a story.
                  <br />
                  <span className="font-normal italic text-[#1B3A6B]">Keep every detail alive.</span>
                </h1>

                <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-[#4b5f79] sm:text-lg">
                  Wandrly turns one strong destination brief into a cinematic, operational,
                  premium trip plan you can actually use from the first idea to the final memory.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <AuthButton
                    isLoggedIn={isLoggedIn}
                    className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#024785,#2B5F9E)] px-8 py-4 text-base font-semibold text-white shadow-[0_26px_54px_rgba(2,71,133,0.2)] transition hover:translate-y-[-1px] hover:brightness-105"
                  >
                    Launch planning
                    <ArrowRight className="size-4" />
                  </AuthButton>
                  <Link href="/explore">
                    <Button
                      variant="outline"
                      className="min-w-[220px] rounded-full border-white/60 bg-white/82 px-8 py-6 text-base text-[#024785] backdrop-blur-xl"
                    >
                      <CirclePlay className="size-5" />
                      View journeys
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <div className="mt-14 grid gap-5 lg:grid-cols-[1.18fr_0.82fr]">
                <motion.div
                  initial={false}
                  animate={{
                    opacity: showIntro ? 0.28 : 1,
                    y: showIntro ? 48 : 0,
                  }}
                  transition={{ duration: 1.3, delay: showIntro ? 0 : 0.28 }}
                  className="relative overflow-hidden rounded-[34px] border border-white/60 bg-white/60 p-5 shadow-[0_24px_48px_rgba(26,28,27,0.08)] backdrop-blur-xl"
                >
                  <div className="absolute -right-10 top-[-24px] h-32 w-32 rounded-full bg-[#9dd8ff]/35 blur-3xl" />
                  <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr_0.8fr_auto]">
                    {[
                      ["Destination", "Amalfi Coast, Italy"],
                      ["Travel window", "14 Sep - 20 Sep"],
                      ["Travelers", "2 adults"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[22px] bg-[#f5ede2] px-5 py-5 text-left">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8ca3]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm font-medium text-[#1A1C1B]">{value}</p>
                      </div>
                    ))}

                    <Link href="/ai-trip-planner" className="flex">
                      <Button className="h-full w-full rounded-[22px] px-6">Generate itinerary</Button>
                    </Link>
                  </div>
                </motion.div>

                <motion.div
                  initial={false}
                  animate={{
                    opacity: showIntro ? 0.24 : 1,
                    y: showIntro ? 54 : 0,
                  }}
                  transition={{ duration: 1.35, delay: showIntro ? 0 : 0.36 }}
                  className="relative overflow-hidden rounded-[34px] border border-white/60 bg-[#024785] p-6 text-white shadow-[0_26px_54px_rgba(2,71,133,0.16)]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(157,216,255,0.26),transparent_36%)]" />
                  <div className="relative">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/68">
                      Live planning logic
                    </p>
                    <h2 className="mt-4 font-[family-name:var(--font-noto-serif)] text-[2.1rem] font-bold tracking-[-0.05em]">
                      One brief. One route. One complete workspace.
                    </h2>
                    <div className="mt-6 space-y-3">
                      {[
                        "AI drafts the first itinerary",
                        "Saved plan shapes maps and route stops",
                        "Dates improve packing and weather logic",
                        "Trip data powers budgets, docs, and journals",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-[18px] bg-white/8 px-4 py-3 text-sm text-white/84 backdrop-blur-xl"
                        >
                          <Compass className="size-4 text-[#9dd8ff]" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="app-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label">Why Wandrly works</p>
            <h2 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[2.8rem] font-bold tracking-[-0.05em] text-[#024785] sm:text-[3.8rem]">
              Premium planning should feel immersive, not complicated.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {featureCards.map((item, index) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className={`rounded-[30px] p-8 shadow-[0_18px_36px_rgba(26,28,27,0.05)] ${
                  index === 0 ? "bg-[#024785] text-white" : "bg-white"
                }`}
              >
                <div
                  className={`inline-flex rounded-2xl p-3 ${
                    index === 0 ? "bg-white/10 text-white" : "bg-[#edf2f9] text-[#024785]"
                  }`}
                >
                  {item.icon}
                </div>
                <h3
                  className={`mt-5 font-[family-name:var(--font-noto-serif)] text-[2rem] font-bold tracking-[-0.04em] ${
                    index === 0 ? "text-white" : "text-[#024785]"
                  }`}
                >
                  {item.title}
                </h3>
                <p className={`mt-3 text-sm leading-8 ${index === 0 ? "text-white/82" : "text-[#61738C]"}`}>
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4efe8] px-4 py-24 sm:px-6 lg:px-8">
        <div className="app-shell">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="section-label">Signature escapes</p>
              <h2 className="mt-5 font-[family-name:var(--font-noto-serif)] text-[2.9rem] font-bold tracking-[-0.05em] text-[#024785] sm:text-[3.9rem]">
                Routes worth planning properly.
              </h2>
            </div>
            <Link href="/ai-trip-planner" className="inline-flex">
              <Button variant="outline" className="rounded-full">Start your plan</Button>
            </Link>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {featuredDestinations.map((destination) => (
              <DestinationCard key={destination.title} {...destination} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="app-shell overflow-hidden rounded-[42px] shadow-[0_24px_54px_rgba(26,28,27,0.08)]">
          <div
            className="flex min-h-[360px] items-center justify-center bg-cover bg-center px-8 text-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg,rgba(2,71,133,0.18),rgba(2,71,133,0.5)),url('https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80')",
            }}
          >
            <div className="max-w-3xl">
              <h2 className="font-[family-name:var(--font-noto-serif)] text-[3rem] font-bold tracking-[-0.05em] text-white sm:text-[4.3rem]">
                Your trip deserves a better opening move.
              </h2>
              <p className="mt-5 text-base leading-8 text-white/86">
                Start with one idea, turn it into a route you trust, and keep every practical
                detail in one beautifully managed system.
              </p>
              <div className="mt-8">
                <Link href={isLoggedIn ? "/trips" : "/ai-trip-planner"}>
                  <Button variant="outline" className="rounded-full border-white/60 bg-white text-[#024785]">
                    Open Wandrly
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
