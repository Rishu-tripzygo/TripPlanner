import BrandLogo from "@/components/brand-logo";
import Link from "next/link";

const footerColumns = [
  {
    title: "Product",
    links: [
      { href: "/ai-trip-planner", label: "Plan with AI" },
      { href: "/trips", label: "Trip workspace" },
      { href: "/explore", label: "Explore trips" },
      { href: "/assistant", label: "Travel assistant" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/support", label: "Support" },
      { href: "/safety", label: "Safety" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms & conditions" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="px-4 pb-24 pt-14 sm:px-6 sm:pb-10 lg:px-8">
      <div className="app-shell overflow-hidden rounded-[36px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.56))] shadow-[0_26px_60px_rgba(22,40,64,0.08)] backdrop-blur-[24px]">
        <div className="relative px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="hero-orb left-[-5%] top-[16%] h-[180px] w-[180px] bg-[rgba(0,194,255,0.12)]" />
          <div className="hero-orb right-[-4%] top-[8%] h-[180px] w-[180px] bg-[rgba(255,204,170,0.18)]" />

          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-lg">
              <BrandLogo />
              <p className="mt-5 text-sm leading-8 text-[#61738C]">
                Wandrly brings itinerary intelligence, route planning, and trip operations into one
                calm premium workspace built for modern travelers.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#14518b]">
                    {column.title}
                  </p>
                  <div className="mt-4 space-y-3">
                    {column.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="block text-sm text-[#61738C] transition hover:text-[#14518b]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-8 flex flex-col gap-3 border-t border-white/45 pt-5 text-xs uppercase tracking-[0.2em] text-[#7A879B] sm:flex-row sm:items-center sm:justify-between">
            <span>Wandrly AI · Curated travel intelligence</span>
            <span>© 2026 Wandrly. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
