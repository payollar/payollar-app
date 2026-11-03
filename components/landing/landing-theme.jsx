"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "payollar-landing-theme";

/** Daytime (6:00–17:59) → white; night (18:00–5:59) → dark */
export function getTimeBasedLandingTheme(date = new Date()) {
  const hour = date.getHours();
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

function resolveLandingTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return getTimeBasedLandingTheme();
}

const LandingThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  mounted: false,
});

export function useLandingTheme() {
  return useContext(LandingThemeContext);
}

export function LandingThemeProvider({ children, className }) {
  const [theme, setThemeState] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(resolveLandingTheme());
    setMounted(true);
  }, []);

  const setTheme = useCallback((next) => {
    const value = next === "light" ? "light" : "dark";
    setThemeState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, mounted }),
    [theme, setTheme, toggleTheme, mounted]
  );

  const isLight = theme === "light";

  return (
    <LandingThemeContext.Provider value={value}>
      <div
        data-landing-page
        data-theme={isLight ? "light" : undefined}
        className={cn(
          "relative min-h-dvh transition-colors duration-300",
          isLight ? "bg-[#f4f6fb] text-slate-900" : "bg-background text-foreground",
          className
        )}
      >
        {children}
      </div>
    </LandingThemeContext.Provider>
  );
}

export function LandingThemeToggle({ className }) {
  const { theme, toggleTheme, mounted } = useLandingTheme();
  const isLight = theme === "light";

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark theme" : "Switch to white theme"}
      title={isLight ? "Switch to dark theme" : "Switch to white theme"}
      className={cn(
        "rounded-full",
        isLight
          ? "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
          : "text-white hover:bg-white/10",
        className
      )}
    >
      {!mounted ? (
        <Sun className="size-4 opacity-0" aria-hidden />
      ) : isLight ? (
        <Moon className="size-4" />
      ) : (
        <Sun className="size-4" />
      )}
    </Button>
  );
}
