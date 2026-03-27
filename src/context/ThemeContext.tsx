"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeId = "obsidian" | "aurora" | "daylight";

const STORAGE_KEY = "facs-theme";

const VALID: ThemeId[] = ["obsidian", "aurora", "daylight"];

function isThemeId(v: string | null): v is ThemeId {
  return v !== null && VALID.includes(v as ThemeId);
}

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("obsidian");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = isThemeId(stored) ? stored : "obsidian";
    document.documentElement.setAttribute("data-theme", initial);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydrate from localStorage after SSR
    setThemeState(initial);
  }, []);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
