import BrandLogo from "@/components/brand-logo";
import Link from "next/link";
import { Compass, Globe2, MapPinned, Sparkles } from "lucide-react";

const footerSections = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Home" },
      { href: "/ai-trip-planner", label: "AI Planner" },
      { href: "/trips", label: "Trips Dashboard" },
    ],
  },
  {
    title: "Core Modules",
    links: [
      { href: "/trips", label: "Maps and Itineraries" },
      { href: "/trips", label: "Budget and Packing" },
      { href: "/trips", label: "Documents and Journal" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="px-3 pb-24 pt-12 sm:px-6 sm:pb-10">
      <div className="app-shell overflow-hidden rounded-[32px] border border-[var(--border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_90%,transparent),color-mix(in_srgb,var(--card)_96%,transparent))] shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
        <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10 lg:py-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-4">
              <BrandLogo compact />
              <div>
                <p className="text-[1.18rem] font-semibold tracking-[-0.04em] text-white">
                  Wandrly
                </p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.32em] text-[#8FA0BC]">
                  Premium AI Travel Planner
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-8 text-[#8FA0BC]">
              A high-end travel planning workspace for immersive itinerary design, route mapping,
              budgeting, packing, journaling, and destination decision-making.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { icon: <Sparkles className="size-4" />, label: "AI itinerary engine" },
                { icon: <MapPinned className="size-4" />, label: "Route-aware planning" },
                { icon: <Globe2 className="size-4" />, label: "Travel memory system" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-[#DCE6F3]"
                >
                  <span className="text-[#00C2FF]">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#00C2FF]">
                {section.title}
              </p>
              <div className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-[#8FA0BC] transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/8 px-6 py-4 text-sm text-[#73849F] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>Wandrly is being shaped as a premium travel product experience, not just a demo.</p>
          <div className="inline-flex items-center gap-2">
            <Compass className="size-4 text-[#00C2FF]" />
            <span>Designed for planning, selling, and client-facing presentation.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
