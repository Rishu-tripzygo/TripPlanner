"use client";

import BrandLogo from "@/components/brand-logo";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { login, logout } from "@/lib/auth-actions";
import { ThemePreference } from "@/lib/phase-one-types";
import { cn } from "@/lib/utils";
import { Home, Laptop, Map, MoonStar, Sparkles, SunMedium, UserRound } from "lucide-react";
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
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-[20px]">
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
                      ? "bg-[var(--surface-2)] text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--input)] hover:text-[var(--foreground)]"
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
            <div className="flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] p-1">
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
                        ? "bg-[var(--surface-2)] text-[var(--foreground)]"
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
                <div className="rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--muted-foreground)]">
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
                  isActive
                    ? "bg-[var(--surface-2)] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)]"
                )}
              >
                <Icon className={cn("size-4", isActive ? "text-[#00C2FF]" : "")} />
                {item.label}
              </Link>
            );
          })}

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
            className="flex min-w-[64px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
          >
            {preference === "DARK" ? (
              <MoonStar className="size-4" />
            ) : preference === "LIGHT" ? (
              <SunMedium className="size-4" />
            ) : (
              <Laptop className="size-4" />
            )}
            Theme
          </button>

          <button
            onClick={session ? logout : login}
            className="flex min-w-[64px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
          >
            <UserRound className="size-4" />
            {session ? "Profile" : "Login"}
          </button>
        </div>
      </div>
    </>
  );
}
