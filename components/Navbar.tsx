"use client";

import BrandLogo from "@/components/brand-logo";
import GlobalSearch from "@/components/global-search";
import NotificationBell from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Compass, Home, LogOut, Map, Search, Sparkles, UserRound, UsersRound } from "lucide-react";
import { Session } from "next-auth";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/ai-trip-planner", label: "Plan", icon: Sparkles },
  { href: "/trips", label: "Trips", icon: Map },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/assistant", label: "Assistant", icon: UsersRound },
];

export default function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: liveSession } = useSession();
  const currentSession = liveSession ?? session;

  async function handleLogin() {
    await signIn("github", { callbackUrl: "/trips" });
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
        <div className="app-shell rounded-[28px] border border-[rgba(2,71,133,0.08)] bg-[color:var(--nav-bg)] shadow-[0_20px_40px_rgba(26,28,27,0.06)] backdrop-blur-[24px]">
          <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <Link href="/" className="shrink-0 transition hover:opacity-90">
              <BrandLogo />
            </Link>

            <nav className="hidden items-center gap-6 xl:flex">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "border-b-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.24em] transition-colors",
                      isActive
                        ? "border-[#024785] text-[#024785]"
                        : "border-transparent text-[#61738C] hover:text-[#024785]"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden min-w-0 items-center gap-3 xl:flex">
              <div className="max-w-[280px] shrink">
                <GlobalSearch />
              </div>

              {currentSession ? (
                <>
                  <NotificationBell />
                  <Link
                    href="/trips"
                    className="inline-flex max-w-[180px] items-center gap-2 rounded-full bg-[#F4F3F1] px-4 py-2 text-sm text-[#3E536F]"
                  >
                    <UserRound className="size-4 text-[#024785]" />
                    <span className="truncate">
                      {currentSession.user?.name || "Traveler"}
                    </span>
                  </Link>
                  <Button variant="outline" onClick={handleLogout} className="shrink-0 rounded-full px-4">
                    <span className="inline-flex items-center gap-2">
                      <LogOut className="size-4" />
                      Sign out
                    </span>
                  </Button>
                </>
              ) : (
                <Button onClick={handleLogin} className="rounded-full px-5">Sign in</Button>
              )}
            </div>

            <div className="flex items-center gap-2 xl:hidden">
              {currentSession ? <NotificationBell /> : null}
              {currentSession ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex size-10 items-center justify-center rounded-full bg-[#F4F3F1] text-[#024785]"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLogin}
                  className="inline-flex size-10 items-center justify-center rounded-full bg-[#F4F3F1] text-[#024785]"
                  aria-label="Sign in"
                >
                  <Compass className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="fixed inset-x-3 bottom-4 z-50 xl:hidden">
        <div className="glass-panel flex items-center justify-between rounded-full border border-[rgba(2,71,133,0.08)] bg-[rgba(255,255,255,0.88)] px-3 py-2 shadow-[0_20px_40px_rgba(26,28,27,0.12)]">
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
                  isActive ? "bg-[#EEF2F8] text-[#024785]" : "text-[#61738C]"
                )}
              >
                <Icon className={cn("size-4", isActive ? "text-[#024785]" : "")} />
                {item.label}
              </Link>
            );
          })}

          {currentSession ? (
            <button
              onClick={handleLogout}
              className="flex min-w-[64px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium text-[#61738C] transition hover:text-[#024785]"
            >
              <LogOut className="size-4" />
              Exit
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="flex min-w-[64px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium text-[#61738C] transition hover:text-[#024785]"
            >
              <Compass className="size-4" />
              Login
            </button>
          )}
        </div>
      </div>
    </>
  );
}
