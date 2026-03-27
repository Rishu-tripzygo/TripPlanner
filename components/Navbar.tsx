"use client";

import BrandLogo from "@/components/brand-logo";
import GlobalSearch from "@/components/global-search";
import NotificationBell from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Compass,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { Session } from "next-auth";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/ai-trip-planner", label: "Plan" },
  { href: "/trips", label: "Trips" },
  { href: "/explore", label: "Explore" },
  { href: "/assistant", label: "Assistant" },
];

const desktopAccountLinks = [
  { href: "/trips", label: "My trips", icon: Compass },
  { href: "/ai-trip-planner", label: "Plan with AI", icon: Sparkles },
  { href: "/support", label: "Support", icon: Settings },
];

export default function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: liveSession } = useSession();
  const currentSession = liveSession ?? session;
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const brandLight = isHome && !isScrolled;
  const shellClass = isHome ? "landing-shell" : "app-shell";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }

    if (accountOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [accountOpen]);

  async function handleLogin() {
    router.push("/auth/signin?callbackUrl=/trips");
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
    router.refresh();
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isHome ? "px-2 pt-3 sm:px-4 lg:px-5" : "px-3 pt-3 sm:px-6"
      )}
    >
      <div
        className={cn(
          shellClass,
          "rounded-[32px] border shadow-[0_24px_60px_rgba(18,23,34,0.08)] backdrop-blur-[26px] transition-all duration-300",
          brandLight
            ? "border-white/20 bg-[rgba(26,22,28,0.24)]"
            : "border-white/55 bg-[rgba(255,255,255,0.72)]"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-3 transition-all duration-300",
            isScrolled ? "px-4 py-3 sm:px-6" : "px-4 py-4 sm:px-6"
          )}
        >
          <Link href="/" className="shrink-0 transition hover:opacity-90">
            <BrandLogo compact={false} light={brandLight} />
          </Link>

          <nav
            className={cn(
              "hidden items-center gap-1 rounded-full px-2 py-2 lg:flex",
              brandLight ? "border border-white/16 bg-white/10 backdrop-blur-xl" : "bg-[#f5f3ef]"
            )}
          >
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] transition",
                    brandLight
                      ? isActive
                        ? "bg-white text-[#2c2a31]"
                        : "text-white/76 hover:bg-white/10 hover:text-white"
                      : isActive
                        ? "bg-white text-[#0f3460] shadow-[0_10px_20px_rgba(18,23,34,0.06)]"
                        : "text-[#61738C] hover:bg-white hover:text-[#14518b]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {!isHome ? (
              <div className="w-[118px] xl:w-[128px]">
                <GlobalSearch compact />
              </div>
            ) : null}

            {currentSession ? (
              <>
                {!isHome ? <NotificationBell /> : null}
                <div ref={accountRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((value) => !value)}
                    className={cn(
                      "inline-flex max-w-[220px] items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition",
                      brandLight
                        ? "border-white/20 bg-white/12 text-white backdrop-blur-xl hover:bg-white/16"
                        : "border-white/55 bg-white/70 text-[#415873] backdrop-blur-xl hover:bg-white"
                    )}
                  >
                    <UserRound
                      className={cn("size-4 shrink-0", brandLight ? "text-white" : "text-[#14518b]")}
                    />
                    <span className="truncate">{currentSession.user?.name || "Traveler"}</span>
                  </button>

                  {accountOpen ? (
                    <div className="absolute right-0 top-14 z-50 w-[320px] rounded-[28px] border border-white/55 bg-[rgba(255,255,255,0.84)] p-4 shadow-[0_24px_48px_rgba(22,40,64,0.12)] backdrop-blur-[28px]">
                      <div className="rounded-[22px] border border-white/55 bg-white/70 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7A8EA8]">
                          Signed in as
                        </p>
                        <p className="mt-2 text-base font-semibold text-[#0f3460]">
                          {currentSession.user?.name || "Traveler"}
                        </p>
                        <p className="mt-1 truncate text-sm text-[#61738C]">
                          {currentSession.user?.email || "Wandrly account"}
                        </p>
                      </div>

                      <div className="mt-3 space-y-2">
                        {desktopAccountLinks.map((item) => {
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center justify-between rounded-[18px] border border-white/45 bg-white/56 px-4 py-3 text-sm font-medium text-[#415873] transition hover:bg-white hover:text-[#14518b]"
                            >
                              <span className="inline-flex items-center gap-3">
                                <Icon className="size-4 text-[#14518b]" />
                                {item.label}
                              </span>
                              <ArrowHint />
                            </Link>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="mt-3 w-full rounded-[18px] border-white/55 bg-white/68 py-5 text-sm"
                      >
                        <LogOut className="size-4" />
                        Sign out
                      </Button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className={cn(
                    "rounded-full px-5",
                    brandLight
                      ? "border-white/24 bg-white/10 text-white hover:bg-white/16 hover:text-white"
                      : "border-white/55 bg-white/70"
                  )}
                >
                  Sign in
                </Button>
                <Link href="/ai-trip-planner">
                  <Button
                    className={cn(
                      "rounded-full px-5",
                      brandLight &&
                        "border border-white/20 bg-white text-[#2c2a31] hover:bg-white"
                    )}
                  >
                    {isHome ? "Start Planning" : "Plan Your Trip"}
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {currentSession && !isHome ? <NotificationBell /> : null}
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-full border backdrop-blur-xl",
                brandLight
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/55 bg-white/70 text-[#14518b]"
              )}
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/35 px-4 pb-4 pt-4 lg:hidden sm:px-6">
            <div
              className={cn(
                "rounded-[28px] border p-4 shadow-[0_18px_40px_rgba(22,40,64,0.08)] backdrop-blur-[26px]",
                brandLight
                  ? "border-white/18 bg-[rgba(32,28,34,0.4)]"
                  : "border-white/45 bg-[rgba(255,255,255,0.74)]"
              )}
            >
              <div className="space-y-2">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-[18px] px-4 py-3 text-sm font-medium transition",
                        brandLight
                          ? isActive
                            ? "bg-white text-[#2c2a31]"
                            : "text-white/76 hover:bg-white/10 hover:text-white"
                          : isActive
                            ? "bg-[#eef4fb] text-[#14518b]"
                            : "text-[#61738C] hover:bg-white/60 hover:text-[#14518b]"
                      )}
                    >
                      {item.label}
                      {item.href === "/ai-trip-planner" ? (
                        <Sparkles className="size-4" />
                      ) : item.href === "/assistant" ? (
                        <UsersRound className="size-4" />
                      ) : item.href === "/explore" ? (
                        <Search className="size-4" />
                      ) : (
                        <Compass className="size-4" />
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {!isHome ? <GlobalSearch /> : null}

                {currentSession ? (
                  <>
                    <div
                      className={cn(
                        "rounded-[20px] border px-4 py-4",
                        brandLight
                          ? "border-white/16 bg-white/8 text-white"
                          : "border-white/45 bg-white/60 text-[#415873]"
                      )}
                    >
                      <p className="text-[11px] uppercase tracking-[0.22em] text-inherit/70">
                        Account
                      </p>
                      <p className="mt-2 text-sm font-medium">{currentSession.user?.name || "Traveler"}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className={cn(
                        "rounded-full",
                        brandLight &&
                          "border-white/20 bg-white/10 text-white hover:bg-white/16 hover:text-white"
                      )}
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleLogin}
                      className={cn(
                        "rounded-full",
                        brandLight &&
                          "border-white/20 bg-white/10 text-white hover:bg-white/16 hover:text-white"
                      )}
                    >
                      Sign in
                    </Button>
                    <Link href="/ai-trip-planner">
                      <Button
                        className={cn(
                          "w-full rounded-full",
                          brandLight &&
                            "border border-white/20 bg-white text-[#2c2a31] hover:bg-white"
                        )}
                      >
                        {isHome ? "Start Planning" : "Plan Your Trip"}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function ArrowHint() {
  return <span className="text-[#9BAAC0]">→</span>;
}
