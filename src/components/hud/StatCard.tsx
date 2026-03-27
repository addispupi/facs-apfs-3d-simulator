"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SmoothedNumber } from "@/components/hud/SmoothedNumber";

export function StatCard({
  label,
  value,
  iconSrc,
}: {
  label: string;
  value: number;
  iconSrc: string;
}) {
  const active = value > 0.5;

  return (
    <div className="glass-stat-hud group relative flex min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:border-[color:rgb(224_96_4_/0.42)] hover:shadow-[0_8px_40px_rgba(224,96,4,0.2)]">
      <div className="relative z-[1] flex flex-col">
        <div className="grid grid-cols-[auto_1fr] items-center gap-3 px-4 py-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgb(255_255_255_/0.06)] ring-1 ring-[rgb(255_255_255_/0.08)] transition-all duration-300 ease-out group-hover:bg-[#e06004]/14 group-hover:ring-[#e06004]/45">
            <Image
              src={iconSrc}
              alt=""
              width={28}
              height={28}
              className="emotion-stat-icon opacity-95"
              unoptimized
            />
          </div>

          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[10px] font-bold tracking-widest text-hud-muted uppercase">
              {label}
            </span>
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`font-mono text-xl font-semibold tabular-nums transition-colors duration-300 ${
                active
                  ? "text-[var(--brand-primary)]"
                  : "text-hud-foreground"
              }`}
            >
              <SmoothedNumber value={value} />
            </motion.div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 z-[2] h-[2px] w-0 bg-accent-hover shadow-[0_0_16px_rgba(224,96,4,0.65)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:w-full"
          aria-hidden
        />
      </div>
    </div>
  );
}
