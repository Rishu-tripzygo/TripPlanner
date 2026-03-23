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
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="px-4 pb-24 pt-10 sm:px-6 sm:pb-10 lg:px-8">
      <div className="app-shell rounded-[34px] border border-[rgba(2,71,133,0.08)] bg-[linear-gradient(180deg,#fffdfb,#f5f0e8)] px-6 py-8 shadow-[0_18px_36px_rgba(26,28,27,0.05)] sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-lg">
            <BrandLogo />
            <p className="mt-5 text-sm leading-8 text-[#61738C]">
              Premium travel planning, route intelligence, and trip operations in one calm
              workspace built for real journeys.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#024785]">
                  {column.title}
                </p>
                <div className="mt-4 space-y-3">
                  {column.links.map((link) => (
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

        <div className="mt-8 border-t border-[rgba(2,71,133,0.08)] pt-5 text-xs uppercase tracking-[0.2em] text-[#7A879B]">
          Wandrly AI · Curated travel intelligence
        </div>
      </div>
    </footer>
  );
}
