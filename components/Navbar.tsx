"use client";

import BrandLogo from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { login, logout } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";
import { Home, Map, Sparkles, UserRound } from "lucide-react";
import { Session } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/ai-trip-planner", label: "AI Planner", icon: Sparkles },
  { href: "/trips", label: "Trips", icon: Map },
];

export default function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname();

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#08090E]/70 backdrop-blur-[20px]">
        <div className="app-shell flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="transition hover:opacity-95">
            <BrandLogo />
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-white/[0.06] text-white"
                      : "text-[#8B9BB4] hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  {item.label}
                  {isActive ? (
                    <span className="absolute inset-x-4 -bottom-[17px] h-[2px] rounded-full bg-[#00C2FF]" />
                  ) : null}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {session ? (
              <>
                <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-[#8B9BB4]">
                  {session.user?.name || "Traveler"}
                </div>
                <Button variant="outline" onClick={logout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={login}>Sign In</Button>
            )}
          </div>
        </div>
      </nav>

      <div className="fixed inset-x-3 bottom-4 z-50 md:hidden">
        <div className="glass-panel flex items-center justify-between rounded-full px-4 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-[64px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium transition",
                  isActive ? "bg-white/10 text-white" : "text-[#8B9BB4]"
                )}
              >
                <Icon className={cn("size-4", isActive ? "text-[#00C2FF]" : "")} />
                {item.label}
              </Link>
            );
          })}

          <button
            onClick={session ? logout : login}
            className="flex min-w-[64px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium text-[#8B9BB4] transition hover:text-white"
          >
            <UserRound className="size-4" />
            {session ? "Profile" : "Login"}
          </button>
        </div>
      </div>
    </>
  );
}
