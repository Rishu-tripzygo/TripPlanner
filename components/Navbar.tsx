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
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/ai-trip-planner", label: "Plan" },
  { href: "/trips", label: "Trips" },
  { href: "/explore", label: "Explore" },
  { href: "/assistant", label: "Assistant" },
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

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
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
    await signIn("github", { callbackUrl: "/trips" });
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
        <div
          className={cn(
            "app-shell rounded-[30px] border bg-[rgba(255,255,255,0.56)] shadow-[0_24px_50px_rgba(22,40,64,0.08)] backdrop-blur-[26px] transition-all duration-300",
            isScrolled
              ? "border-white/60 bg-[rgba(255,255,255,0.72)]"
              : "border-white/45 bg-[rgba(255,255,255,0.54)]"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between gap-4 transition-all duration-300",
              isScrolled ? "px-4 py-3 sm:px-6" : "px-4 py-4 sm:px-6"
            )}
          >
            <Link href="/" className="shrink-0 transition hover:opacity-90">
              <BrandLogo />
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative text-[11px] font-semibold uppercase tracking-[0.26em] transition-colors",
                      isActive ? "text-[#0f3460]" : "text-[#61738C] hover:text-[#14518b]"
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        "absolute left-0 top-[calc(100%+8px)] h-[2px] rounded-full bg-[#14518b] transition-all",
                        isActive ? "w-full opacity-100" : "w-0 opacity-0"
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              {!isHome ? (
                <div className="w-[250px] xl:w-[280px]">
                  <GlobalSearch />
                </div>
              ) : null}

              {currentSession ? (
                <>
                  {!isHome ? <NotificationBell /> : null}
                  <div ref={accountRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setAccountOpen((value) => !value)}
                      className="inline-flex max-w-[210px] items-center gap-2 rounded-full border border-white/55 bg-white/58 px-4 py-2.5 text-sm text-[#415873] backdrop-blur-xl transition hover:bg-white/72"
                    >
                      <UserRound className="size-4 shrink-0 text-[#14518b]" />
                      <span className="truncate">{currentSession.user?.name || "Traveler"}</span>
                    </button>

                    {accountOpen ? (
                      <div className="absolute right-0 top-14 z-50 w-[300px] rounded-[26px] border border-white/55 bg-[rgba(255,255,255,0.74)] p-4 shadow-[0_24px_48px_rgba(22,40,64,0.12)] backdrop-blur-[26px]">
                        <div className="rounded-[20px] border border-white/55 bg-white/54 p-4">
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
                          {[
                            { href: "/trips", label: "My trips", icon: Compass },
                            { href: "/ai-trip-planner", label: "Plan with AI", icon: Sparkles },
                            { href: "/support", label: "Support", icon: Settings },
                          ].map((item) => {
                            const Icon = item.icon;

                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center justify-between rounded-[18px] border border-white/45 bg-white/48 px-4 py-3 text-sm font-medium text-[#415873] transition hover:bg-white/72 hover:text-[#14518b]"
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
                          className="mt-3 w-full rounded-[18px] border-white/55 bg-white/58 py-5 text-sm"
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
                    className="rounded-full border-white/55 bg-white/58 px-5"
                  >
                    Sign in
                  </Button>
                  <Link href="/ai-trip-planner">
                    <Button className="rounded-full px-5">
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
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/55 bg-white/56 text-[#14518b] backdrop-blur-xl"
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {mobileOpen ? (
            <div className="border-t border-white/45 px-4 pb-4 pt-4 lg:hidden sm:px-6">
              <div className="rounded-[26px] border border-white/45 bg-[rgba(255,255,255,0.58)] p-4 shadow-[0_18px_40px_rgba(22,40,64,0.08)] backdrop-blur-[24px]">
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
                          isActive
                            ? "bg-[#eef4fb] text-[#14518b]"
                            : "text-[#61738C] hover:bg-white/58 hover:text-[#14518b]"
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
                      <Link
                        href="/trips"
                        className="inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/58 px-4 py-3 text-sm text-[#415873] backdrop-blur-xl"
                      >
                        <UserRound className="size-4 text-[#14518b]" />
                        {currentSession.user?.name || "Traveler"}
                      </Link>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="rounded-full border-white/55 bg-white/58"
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
                        className="rounded-full border-white/55 bg-white/58"
                      >
                        Sign in
                      </Button>
                      <Link href="/ai-trip-planner">
                        <Button className="w-full rounded-full">
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
    </>
  );
}

function ArrowHint() {
  return <span className="text-[#9BAAC0]">→</span>;
}
