import BrandLogo from "@/components/brand-logo";
import Link from "next/link";
import { ArrowRight, Globe2, MapPinned, Sparkles } from "lucide-react";

const footerSections = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Home" },
      { href: "/ai-trip-planner", label: "Plan with AI" },
      { href: "/trips", label: "Trip workspace" },
      { href: "/explore", label: "Explore community" },
      { href: "/assistant", label: "Travel assistant" },
    ],
  },
  {
    title: "Journey",
    links: [
      { href: "/trips/new", label: "Create trip shell" },
      { href: "/trips", label: "Budget and packing" },
      { href: "/trips", label: "Documents and journal" },
      { href: "/explore", label: "Public profiles" },
      { href: "/trips", label: "Sharing and memories" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="px-3 pb-24 pt-14 sm:px-6 sm:pb-10">
      <div className="app-shell overflow-hidden rounded-[40px] border border-[rgba(2,71,133,0.08)] bg-[linear-gradient(180deg,#fffdfb,#f6f2ec)] shadow-[0_24px_60px_rgba(26,28,27,0.08)]">
        <div className="grid gap-10 border-b border-[rgba(2,71,133,0.08)] px-6 py-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-14">
          <div className="max-w-xl">
            <BrandLogo />
            <p className="mt-6 text-sm leading-8 text-[#61738C]">
              Wandrly is a premium travel workspace for people who want the clarity of good
              systems and the feeling of a beautifully planned journey. Plan faster, execute
              better, and keep every trip memorable.
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

            <div className="mt-8 inline-flex">
              <Link
                href="/ai-trip-planner"
                className="inline-flex items-center gap-2 rounded-full bg-[#024785] px-5 py-3 text-sm font-medium text-white shadow-[0_18px_36px_rgba(2,71,133,0.18)] transition hover:translate-y-[-1px] hover:brightness-105"
              >
                Start planning
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
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
        </div>

        <div className="grid gap-4 px-6 py-5 text-sm text-[#7A879B] sm:px-8 lg:grid-cols-[1fr_auto] lg:px-12">
          <p>Wandrly AI. Curated journeys, mapped clearly, remembered beautifully.</p>
          <p className="lg:text-right">Built for public launch, client demos, and real travel planning workflows.</p>
        </div>
      </div>
    </footer>
  );
}
