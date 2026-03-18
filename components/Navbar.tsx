"use client";

import BrandLogo from "@/components/brand-logo";
import NotificationBell from "@/components/notification-bell";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { login, logout } from "@/lib/auth-actions";
import { ThemePreference } from "@/lib/phase-one-types";
import { cn } from "@/lib/utils";
import {
  Compass,
  Home,
  Laptop,
  Map,
  MoonStar,
  Sparkles,
  SunMedium,
  UserRound,
} from "lucide-react";
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
  const { preference, setPreference } = useTheme();

  const themeOptions: Array<{
    value: ThemePreference;
    label: string;
    icon: typeof SunMedium;
  }> = [
    { value: "LIGHT", label: "Light", icon: SunMedium },
    { value: "DARK", label: "Dark", icon: MoonStar },
    { value: "SYSTEM", label: "System", icon: Laptop },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
        <div className="app-shell rounded-[24px] border border-[var(--border-strong)] bg-[color:var(--nav-bg)] shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-[24px]">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <Link href="/" className="transition hover:opacity-95">
              <BrandLogo />
            </Link>

            <div className="hidden items-center gap-2 lg:flex">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition",
                      isActive
                        ? "bg-[var(--surface-3)] text-[var(--foreground)] shadow-[0_0_0_1px_var(--border),0_12px_30px_rgba(0,0,0,0.12)]"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <Icon className={cn("size-4", isActive ? "text-[#00C2FF]" : "")} />
                    {item.label}
                    {isActive ? (
                      <span className="absolute inset-x-4 -bottom-0.5 h-[2px] rounded-full bg-[linear-gradient(90deg,#00C2FF,rgba(255,255,255,0.5),#1B3A6B)]" />
                    ) : null}
                  </Link>
                );
              })}
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] p-1.5">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const active = preference === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPreference(option.value)}
                      className={cn(
                        "rounded-full px-3 py-2 text-xs font-medium transition",
                        active
                          ? "bg-[var(--surface-3)] text-[var(--foreground)]"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon className="size-4" />
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {session ? (
                <>
                  <NotificationBell />
                  <div className="hidden rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--muted-foreground)] xl:block">
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

            <div className="flex items-center gap-2 lg:hidden">
              {session ? <NotificationBell /> : null}
              <button
                type="button"
                onClick={() =>
                  setPreference(
                    preference === "DARK"
                      ? "LIGHT"
                      : preference === "LIGHT"
                        ? "SYSTEM"
                        : "DARK"
                  )
                }
                className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[var(--foreground)]"
              >
                {preference === "DARK" ? (
                  <MoonStar className="size-4" />
                ) : preference === "LIGHT" ? (
                  <SunMedium className="size-4" />
                ) : (
                  <Laptop className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="fixed inset-x-3 bottom-4 z-50 lg:hidden">
        <div className="glass-panel flex items-center justify-between rounded-full px-3 py-2 shadow-[0_20px_60px_rgba(0,0,0,0.42)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-[66px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium transition",
                  isActive
                    ? "bg-[var(--surface-3)] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)]"
                )}
              >
                <Icon className={cn("size-4", isActive ? "text-[#00C2FF]" : "")} />
                {item.label}
              </Link>
            );
          })}

          {session ? (
            <button
              onClick={logout}
              className="flex min-w-[66px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
            >
              <UserRound className="size-4" />
              Exit
            </button>
          ) : (
            <button
              onClick={login}
              className="flex min-w-[66px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
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
