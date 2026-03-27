"use client";

import { motion } from "framer-motion";
import type { BlendshapeData } from "@/types/facs";

export function BlendSlider({
  data,
  onChange,
}: {
  data: BlendshapeData;
  onChange: (v: number) => void;
}) {
  return (
    <div className="relative space-y-2">
      <div className="flex justify-between font-mono text-[10px]">
        <span className="text-hud-muted">
          {data.name}{" "}
          <span className="italic opacity-50">({data.label})</span>
        </span>
        <span className="text-[var(--brand-primary)]">
          {(data.value * 100).toFixed(0)}%
        </span>
      </div>
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--track-bg)" }}
      >
        <motion.div
          initial={false}
          animate={{ width: `${data.value * 100}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 22 }}
          className={`h-full bg-gradient-to-r ${data.color} shadow-[0_0_15px_rgba(249,116,22,0.22)]`}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={data.value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label={`${data.name} blend weight`}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}
