"use client";

import BrandLogo from "@/components/brand-logo";
import Link from "next/link";

const footerColumns = [
  {
    title: "Product",
    links: [
      { href: "/ai-trip-planner", label: "Plan with AI" },
      { href: "/trips", label: "Trip workspace" },
      { href: "/explore", label: "Explore" },
      { href: "/assistant", label: "Assistant" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/support", label: "Support" },
      { href: "/safety", label: "Safety" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="px-4 pb-24 pt-12 sm:px-5 sm:pb-10 lg:px-6">
      <div className="landing-shell rounded-[34px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,250,246,0.92),rgba(255,255,255,0.82))] shadow-[0_22px_50px_rgba(18,23,34,0.08)] backdrop-blur-[20px]">
        <div className="px-6 py-7 sm:px-8 sm:py-8 lg:px-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[0.8fr_0.2fr_0.2fr]">
            <div>
              <BrandLogo />
              <p className="mt-4 max-w-lg text-sm leading-7 text-[#667285]">
                Wandrly brings itinerary planning, route review, and trip prep into one calm
                workspace so the whole trip stays together.
              </p>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8d5c45]">
                  {column.title}
                </p>
                <div className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block text-sm text-[#61738C] transition hover:text-[#243453]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-[rgba(2,71,133,0.08)] pt-5 text-xs uppercase tracking-[0.2em] text-[#8a96a8] sm:flex-row sm:items-center sm:justify-between">
            <span>Wandrly AI · Curated travel intelligence</span>
            <span>© 2026 Wandrly. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
