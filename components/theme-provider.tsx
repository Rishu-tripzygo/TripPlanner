"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemePreference } from "@/lib/phase-one-types";

type EffectiveTheme = "light" | "dark";

interface ThemeContextValue {
  preference: ThemePreference;
  effectiveTheme: EffectiveTheme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveEffectiveTheme(preference: ThemePreference): EffectiveTheme {
  if (preference === "LIGHT") return "light";
  if (preference === "DARK") return "dark";

  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "dark";
}

function applyTheme(theme: EffectiveTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.dataset.theme = theme;
}

export function ThemeProvider({
  children,
  initialPreference,
}: {
  children: React.ReactNode;
  initialPreference: ThemePreference;
}) {
  const [preference, setPreferenceState] = useState<ThemePreference>(initialPreference);
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(
    initialPreference === "LIGHT" ? "light" : "dark"
  );

  useEffect(() => {
    const stored = window.localStorage.getItem("theme-preference") as ThemePreference | null;
    const nextPreference =
      stored === "SYSTEM" || stored === "LIGHT" || stored === "DARK"
        ? stored
        : initialPreference;
    const nextTheme = resolveEffectiveTheme(nextPreference);

    setPreferenceState(nextPreference);
    setEffectiveTheme(nextTheme);
    applyTheme(nextTheme);
  }, [initialPreference]);

  useEffect(() => {
    if (preference !== "SYSTEM") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      const nextTheme = mediaQuery.matches ? "dark" : "light";
      setEffectiveTheme(nextTheme);
      applyTheme(nextTheme);
    };

    mediaQuery.addEventListener("change", syncSystemTheme);
    return () => mediaQuery.removeEventListener("change", syncSystemTheme);
  }, [preference]);

  async function setPreference(nextPreference: ThemePreference) {
    const nextTheme = resolveEffectiveTheme(nextPreference);

    setPreferenceState(nextPreference);
    setEffectiveTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem("theme-preference", nextPreference);

    try {
      await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themePreference: nextPreference }),
      });
    } catch {
      // Theme persistence failure should not block local theme changes.
    }
  }

  const value = useMemo(
    () => ({
      preference,
      effectiveTheme,
      setPreference,
    }),
    [preference, effectiveTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
