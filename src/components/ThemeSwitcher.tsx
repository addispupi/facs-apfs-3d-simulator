"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Monitor, Moon, Palette, Sun } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { type ThemeId, useTheme } from "@/context/ThemeContext";

const THEMES: {
  id: ThemeId;
  label: string;
  hint: string;
  icon: typeof Moon;
}[] = [
  {
    id: "obsidian",
    label: "Dark",
    hint: "Dark UI with warm orange accents",
    icon: Moon,
  },
  {
    id: "aurora",
    label: "System",
    hint: "Balanced contrast — cool night palette",
    icon: Monitor,
  },
  {
    id: "daylight",
    label: "Light",
    hint: "Light surfaces and clear typography",
    icon: Sun,
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const groupId = useId();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }
  }, [open]);

  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  const triggerClass =
    "group glass-panel flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold tracking-wide text-[var(--foreground)] shadow-lg transition-all duration-300 ease-out hover:scale-[1.02] hover:border-[color:rgb(224_96_4_/0.45)] hover:bg-[var(--glass-hover)] hover:shadow-[0_8px_28px_rgba(224,96,4,0.22)]";

  return (
    <div ref={panelRef} className="fixed top-4 right-4 z-[200] md:top-6 md:right-8">
      {open ? (
        <button
          type="button"
          className={triggerClass}
          aria-expanded="true"
          aria-controls={groupId}
          aria-label="Change theme"
          onClick={() => setOpen((o) => !o)}
        >
          <Palette className="h-4 w-4 text-[var(--brand-primary)] transition-colors duration-300 ease-out group-hover:text-accent-hover" />
          <span className="hidden sm:inline transition-colors duration-300 ease-out group-hover:text-accent-hover">
            {active.label}
          </span>
        </button>
      ) : (
        <button
          type="button"
          className={triggerClass}
          aria-expanded="false"
          aria-label="Change theme"
          onClick={() => setOpen((o) => !o)}
        >
          <Palette className="h-4 w-4 text-[var(--brand-primary)] transition-colors duration-300 ease-out group-hover:text-accent-hover" />
          <span className="hidden sm:inline transition-colors duration-300 ease-out group-hover:text-accent-hover">
            {active.label}
          </span>
        </button>
      )}

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="glass-panel absolute right-0 mt-2 w-[min(100vw-2rem,17rem)] overflow-hidden rounded-2xl border p-1 shadow-2xl"
          >
            <div
              id={groupId}
              className="flex flex-col gap-0.5 p-0.5"
              role="radiogroup"
              aria-label="Theme"
            >
              {THEMES.map((t) => {
                const Icon = t.icon;
                const selected = theme === t.id;
                const inputId = `${groupId}-${t.id}`;
                return (
                  <label
                    key={t.id}
                    htmlFor={inputId}
                    className={`group/opt flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-300 ${
                      selected
                        ? "bg-orange-500/10 text-[var(--foreground)]"
                        : "text-[var(--foreground-muted)] hover:bg-white/5"
                    }`}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name="theme-picker"
                      value={t.id}
                      checked={selected}
                      onChange={() => {
                        setTheme(t.id);
                        setOpen(false);
                      }}
                      className="sr-only"
                    />
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary)] opacity-90 transition-colors duration-300 group-hover/opt:text-accent-hover" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold">{t.label}</span>
                      <span className="mt-0.5 block text-[10px] leading-snug opacity-70">
                        {t.hint}
                      </span>
                    </span>
                    {selected ? (
                      <Check className="h-4 w-4 shrink-0 text-[var(--brand-accent)]" />
                    ) : null}
                  </label>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
