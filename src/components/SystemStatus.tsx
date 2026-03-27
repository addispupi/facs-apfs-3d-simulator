"use client";

export function SystemStatus({ latencyMs }: { latencyMs: number }) {
  return (
    <div className="glass-panel w-full max-w-[14rem] rounded-2xl px-3 py-2.5 text-right font-mono text-[10px] leading-snug shadow-lg backdrop-blur-md">
      <div className="flex flex-wrap items-baseline justify-end gap-x-1.5 gap-y-0.5">
        <span className="font-semibold tracking-wide text-[var(--brand-accent)]">
          SYSTEM STATUS
        </span>
        <span className="text-[var(--foreground)]">OPTIMAL</span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-baseline justify-end gap-x-1.5">
        <span className="font-semibold tracking-wide text-[var(--brand-primary)]">
          LATENCY
        </span>
        <span className="tabular-nums text-[var(--foreground)]">{latencyMs}MS</span>
      </div>
    </div>
  );
}
