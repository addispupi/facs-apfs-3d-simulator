"use client";

import { motion } from "framer-motion";
import {
  Maximize2,
  Play,
  Radio,
  Square,
  ZoomIn,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import FaceTracker, {
  type FaceBlendShapeCategory,
} from "@/components/FaceTracker";
import type { CameraState } from "@/types/facs";

type CameraPanelProps = {
  onBlendshapesUpdate: (categories: FaceBlendShapeCategory[]) => void;
  /** True when at least one blendshape frame has been received (face likely visible). */
  hasFace: boolean;
};

export default function CameraPanel({
  onBlendshapesUpdate,
  hasFace,
}: CameraPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [camState, setCamState] = useState<CameraState>({
    isPlaying: true,
    isRecording: false,
    zoom: 1,
  });

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen?.();
    }
  }, []);

  const handleEngineReady = useCallback(() => setEngineReady(true), []);

  const aiActive = camState.isPlaying && engineReady;
  const trackingHot = aiActive && hasFace;

  return (
    <section className="relative flex min-h-0 flex-col">
      <div
        ref={containerRef}
        className="group relative flex min-h-[520px] flex-1 flex-col overflow-hidden rounded-[3rem] border border-[var(--card-border)] bg-[var(--card)] shadow-2xl transition-all duration-700 group-hover:border-[var(--card-hover-border)]"
      >
        <FaceTracker
          onBlendshapesUpdate={onBlendshapesUpdate}
          onEngineReady={handleEngineReady}
          isPlaying={camState.isPlaying}
          zoom={camState.zoom}
          className="min-h-[480px] flex-1 rounded-[3rem]"
        />

        <div className="pointer-events-none absolute top-8 right-8 left-8 z-20 flex items-start justify-between">
          <motion.div
            animate={{ opacity: camState.isPlaying ? 1 : 0.55 }}
            className="glass-panel flex items-center gap-3 rounded-full px-4 py-2"
          >
            <div
              className={`h-2 w-2 rounded-full ${
                trackingHot
                  ? "animate-pulse bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                  : aiActive
                    ? "bg-amber-500"
                    : "bg-zinc-600"
              }`}
            />
            <span className="text-[10px] font-bold tracking-widest text-[var(--foreground)] uppercase">
              {aiActive
                ? trackingHot
                  ? "AI Tracking Active"
                  : "AI Ready — Awaiting Face"
                : "Offline"}
            </span>
            {camState.isRecording ? (
              <span className="ml-1 flex items-center gap-1 text-[9px] font-mono text-red-400">
                <Radio className="h-3 w-3 animate-pulse" />
                REC
              </span>
            ) : null}
          </motion.div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="group glass-panel pointer-events-auto rounded-full p-3 transition-all duration-300 ease-out hover:scale-110 hover:bg-[#e06004]/14 hover:shadow-[0_0_24px_rgba(224,96,4,0.35)]"
            aria-label="Toggle fullscreen"
          >
            <Maximize2
              size={16}
              className="text-zinc-400 transition-all duration-300 ease-out group-hover:scale-110 group-hover:text-accent-hover"
            />
          </button>
        </div>

        <div className="glass-panel absolute bottom-8 left-1/2 z-20 flex w-[90%] max-w-xl -translate-x-1/2 items-center gap-6 rounded-[2rem] p-4 shadow-2xl">
          <button
            type="button"
            onClick={() =>
              setCamState((s) => ({ ...s, isPlaying: !s.isPlaying }))
            }
            className="group flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 ease-out hover:scale-105 hover:border-[#e06004]/55 hover:bg-[#e06004]/15 hover:shadow-[0_0_32px_rgba(224,96,4,0.38)] active:scale-[0.96]"
            aria-label={camState.isPlaying ? "Stop camera" : "Start camera"}
          >
            {camState.isPlaying ? (
              <Square
                size={20}
                className="fill-current text-white transition-all duration-300 ease-out group-hover:scale-110 group-hover:text-accent-hover"
              />
            ) : (
              <Play
                size={22}
                className="ml-1 fill-current text-white transition-all duration-300 ease-out group-hover:ml-0.5 group-hover:scale-110 group-hover:text-accent-hover"
              />
            )}
          </button>

          <div className="h-10 w-px shrink-0 bg-white/10" />

          <div className="group/zoom flex flex-1 items-center gap-4">
            <ZoomIn
              size={18}
              className="shrink-0 text-zinc-500 transition-all duration-300 ease-out group-hover/zoom:scale-110 group-hover/zoom:text-accent-hover"
            />
            <input
              type="range"
              min={1}
              max={2.5}
              step={0.05}
              value={camState.zoom}
              onChange={(e) =>
                setCamState((s) => ({
                  ...s,
                  zoom: parseFloat(e.target.value),
                }))
              }
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--track-bg)] accent-[#F97416]"
              aria-label="Digital zoom"
            />
            <span className="w-10 shrink-0 text-right font-mono text-[11px] text-[var(--brand-primary)]">
              {camState.zoom.toFixed(1)}x
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setCamState((s) => ({ ...s, isRecording: !s.isRecording }))
            }
            className={`brand-gradient-fill shrink-0 rounded-full px-6 py-3 text-[10px] font-bold tracking-tighter uppercase transition-opacity ${
              camState.isRecording
                ? "opacity-100 ring-2 ring-red-500/50"
                : "opacity-90 hover:opacity-100"
            }`}
          >
            {camState.isRecording ? "Stop Rec" : "Live / Rec"}
          </button>
        </div>
      </div>
    </section>
  );
}
