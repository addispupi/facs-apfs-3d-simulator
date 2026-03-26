"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Mesh } from "three";
import type { FaceBlendShapeCategory } from "@/components/FaceTracker";

/** Blendshape weights (0–1) driving the 3D mapping. */
export type FacialMappingScores = {
  /** Averaged smile (MediaPipe: left + right). */
  mouthSmile: number;
  browInnerUp: number;
  jawOpen: number;
};

function deriveScores(
  blendshapes: FaceBlendShapeCategory[]
): FacialMappingScores {
  const get = (name: string) =>
    blendshapes.find((b) => b.categoryName === name)?.score ?? 0;
  return {
    mouthSmile: (get("mouthSmileLeft") + get("mouthSmileRight")) / 2,
    browInnerUp: get("browInnerUp"),
    jawOpen: get("jawOpen"),
  };
}

function Ground() {
  const grid = useMemo(
    () => new THREE.GridHelper(24, 24, 0x3f3f46, 0x27272a),
    []
  );
  return <primitive object={grid} position={[0, -1.35, 0]} />;
}

function ExpressionSphere({ scores }: { scores: FacialMappingScores }) {
  const meshRef = useRef<Mesh>(null);
  const scoresRef = useRef(scores);
  useLayoutEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  useFrame(() => {
    const m = meshRef.current;
    if (!m) return;
    const s = scoresRef.current;
    m.rotation.y = s.mouthSmile * Math.PI;
    m.scale.setScalar(1);
    m.scale.y = 1 + s.browInnerUp * 2;
    m.position.y = -s.jawOpen * 2;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 40, 40]} />
      <meshStandardMaterial color="#5eead4" wireframe emissive="#0d3d38" />
    </mesh>
  );
}

function SceneContent({ scores }: { scores: FacialMappingScores }) {
  return (
    <>
      <color attach="background" args={["#09090b"]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[8, 10, 8]} intensity={1.2} />
      <pointLight position={[-6, 4, -4]} intensity={0.35} color="#38bdf8" />
      <Ground />
      <ExpressionSphere scores={scores} />
    </>
  );
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export default function Scene3D({
  currentBlendshapes,
}: {
  currentBlendshapes: FaceBlendShapeCategory[];
}) {
  const derived = useMemo(
    () => deriveScores(currentBlendshapes),
    [currentBlendshapes]
  );

  const [override, setOverride] = useState<Partial<FacialMappingScores>>({});

  const scores: FacialMappingScores = {
    mouthSmile: override.mouthSmile ?? derived.mouthSmile,
    browInnerUp: override.browInnerUp ?? derived.browInnerUp,
    jawOpen: override.jawOpen ?? derived.jawOpen,
  };

  const setChannel = (key: keyof FacialMappingScores, raw: number) => {
    const v = clamp01(raw);
    setOverride((o) => ({ ...o, [key]: v }));
  };

  const resetData = () => setOverride({});

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-700/80 pb-3">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
          Facial Data Mapping (3D)
        </h2>
        <p className="text-xs text-zinc-500 max-w-md text-right">
          Blendshape weights map to the sphere: smile → Y rotation, brow → Y
          scale, jaw → Y position.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs sm:text-sm">
        <div className="rounded-lg bg-zinc-900/90 border border-cyan-900/50 px-3 py-2 text-cyan-300/95">
          SMILE [Y-ROT]:{" "}
          <span className="text-cyan-100 tabular-nums">
            {scores.mouthSmile.toFixed(2)}
          </span>
        </div>
        <div className="rounded-lg bg-zinc-900/90 border border-emerald-900/50 px-3 py-2 text-emerald-300/95">
          BROW [Y-SCALE]:{" "}
          <span className="text-emerald-100 tabular-nums">
            {scores.browInnerUp.toFixed(2)}
          </span>
        </div>
        <div className="rounded-lg bg-zinc-900/90 border border-amber-900/50 px-3 py-2 text-amber-300/95">
          JAW [Y-POS]:{" "}
          <span className="text-amber-100 tabular-nums">
            {scores.jawOpen.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="relative w-full min-h-[280px] rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950">
        <Canvas camera={{ position: [0, 0.35, 5.2], fov: 45 }}>
          <SceneContent scores={scores} />
        </Canvas>
      </div>

      <div className="space-y-4">
        <MappingRow
          label="mouthSmile (Rotate Y)"
          hint="mouthSmileLeft + mouthSmileRight → average"
          value={scores.mouthSmile}
          onChange={(v) => setChannel("mouthSmile", v)}
        />
        <MappingRow
          label="browInnerUp (Scale Y)"
          value={scores.browInnerUp}
          onChange={(v) => setChannel("browInnerUp", v)}
        />
        <MappingRow
          label="jawOpen (Position Y)"
          value={scores.jawOpen}
          onChange={(v) => setChannel("jawOpen", v)}
        />
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={resetData}
          className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 transition-colors"
        >
          Reset Data
        </button>
      </div>
    </div>
  );
}

function MappingRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm text-zinc-300 font-medium">{label}</span>
        <span className="text-xs text-zinc-500 tabular-nums">
          {value.toFixed(2)}
        </span>
      </div>
      {hint ? (
        <p className="text-[11px] text-zinc-600 leading-snug">{hint}</p>
      ) : null}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label={label}
          className="flex-1 h-2 accent-cyan-500 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
        />
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          aria-label={`${label} numeric`}
          className="w-16 shrink-0 rounded border border-zinc-600 bg-zinc-900 px-2 py-1 text-right text-sm text-zinc-200 tabular-nums"
        />
      </div>
    </div>
  );
}
