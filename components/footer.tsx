import BrandLogo from "@/components/brand-logo";
import Link from "next/link";
import { Globe2, MapPinned, Sparkles } from "lucide-react";

const footerSections = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Home" },
      { href: "/ai-trip-planner", label: "Plan with AI" },
      { href: "/trips", label: "Trip workspace" },
      { href: "/globe", label: "Travel globe" },
    ],
  },
  {
    title: "Journey",
    links: [
      { href: "/trips/new", label: "Create trip shell" },
      { href: "/trips", label: "Budget and packing" },
      { href: "/trips", label: "Documents and journal" },
      { href: "/trips", label: "Sharing and memories" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="px-3 pb-24 pt-14 sm:px-6 sm:pb-10">
      <div className="app-shell overflow-hidden rounded-[36px] border border-[rgba(2,71,133,0.08)] bg-[linear-gradient(180deg,#ffffff,#f8f7f4)] shadow-[0_20px_40px_rgba(26,28,27,0.06)]">
        <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-12 lg:py-12">
          <div className="max-w-xl">
            <BrandLogo />
            <p className="mt-6 text-sm leading-8 text-[#61738C]">
              Wandrly is built to feel like a digital travel concierge: elegant enough for
              client presentation, practical enough for real trip execution, and structured
              around the full journey from AI planning to memories.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { icon: <Sparkles className="size-4" />, label: "AI-curated itineraries" },
                { icon: <MapPinned className="size-4" />, label: "Operational trip workspace" },
                { icon: <Globe2 className="size-4" />, label: "Travel memory archive" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F4F3F1] px-3 py-2 text-xs text-[#3E536F]"
                >
                  <span className="text-[#024785]">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#024785]">
                {section.title}
              </p>
              <div className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-[#61738C] transition hover:text-[#024785]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-[rgba(2,71,133,0.08)] px-6 py-4 text-sm text-[#7A879B] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>Wandrly AI. Curated journeys, mapped clearly, remembered beautifully.</p>
          <p>Built for public launch, client demos, and real travel planning workflows.</p>
        </div>
      </div>
    </footer>
  );
}
