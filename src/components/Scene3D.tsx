"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { RotateCcw } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Mesh } from "three";
import { BlendSlider } from "@/components/hud/BlendSlider";
import { StatCard } from "@/components/hud/StatCard";
import type { FaceBlendShapeCategory } from "@/components/FaceTracker";
import type { BlendshapeData } from "@/types/facs";

/** Blendshape weights (0–1) driving the 3D mapping. */
export type FacialMappingScores = {
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
      <meshStandardMaterial color="#f97416" wireframe emissive="#451a03" />
    </mesh>
  );
}

function SceneContent({ scores }: { scores: FacialMappingScores }) {
  return (
    <>
      <color attach="background" args={["#09090b"]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[8, 10, 8]} intensity={1.2} />
      <pointLight position={[-6, 4, -4]} intensity={0.35} color="#f59d0b" />
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

  const scores = useMemo(
    (): FacialMappingScores => ({
      mouthSmile: override.mouthSmile ?? derived.mouthSmile,
      browInnerUp: override.browInnerUp ?? derived.browInnerUp,
      jawOpen: override.jawOpen ?? derived.jawOpen,
    }),
    [derived, override]
  );

  const setChannel = (key: keyof FacialMappingScores, raw: number) => {
    const v = clamp01(raw);
    setOverride((o) => ({ ...o, [key]: v }));
  };

  const resetData = () => setOverride({});

  const blendShapes: BlendshapeData[] = useMemo(
    () => [
      {
        name: "mouthSmile",
        label: "Rotate Y",
        value: scores.mouthSmile,
        color: "from-[var(--brand-primary)] to-[var(--brand-accent)]",
      },
      {
        name: "browInnerUp",
        label: "Scale Y",
        value: scores.browInnerUp,
        color: "from-[var(--brand-accent)] to-[var(--brand-primary)]",
      },
      {
        name: "jawOpen",
        label: "Position Y",
        value: scores.jawOpen,
        color: "from-[var(--brand-primary)] to-[var(--brand-accent)]",
      },
    ],
    [scores]
  );

  return (
    <div className="relative flex h-full min-h-[520px] w-full flex-1 flex-col text-hud-foreground">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[3rem] border border-[var(--card-border)] bg-[var(--scene-shell)] shadow-2xl transition-all duration-700 hover:border-[var(--card-hover-border)]">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
          <div
            className="h-full w-full"
            style={{ background: "var(--glow-radial)" }}
          />
        </div>

        <div className="absolute inset-0 z-0 min-h-0 w-full">
          <Canvas
            className="!absolute inset-0 block h-full w-full"
            camera={{ position: [0, 0.35, 5.2], fov: 45 }}
            gl={{ alpha: false, antialias: true }}
          >
            <SceneContent scores={scores} />
          </Canvas>
        </div>

        <div className="pointer-events-none absolute top-8 right-8 left-8 z-10 flex gap-4">
          <div className="pointer-events-auto flex w-full gap-4">
            <StatCard
              label="Smile"
              value={scores.mouthSmile}
              iconSrc="/icons/emotions/smile.svg"
            />
            <StatCard
              label="Brow"
              value={scores.browInnerUp}
              iconSrc="/icons/emotions/brow.svg"
            />
            <StatCard
              label="Jaw"
              value={scores.jawOpen}
              iconSrc="/icons/emotions/jaw.svg"
            />
          </div>
        </div>

        <div className="pointer-events-none absolute right-6 bottom-6 left-6 z-10 lg:right-8 lg:bottom-7 lg:left-8">
          <div className="glass-blendshape-panel pointer-events-auto space-y-6 p-6">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold tracking-[0.3em] text-[var(--brand-primary)] uppercase">
                  Blendshape Weights
                </span>
                <span className="font-mono text-[9px] text-hud-muted opacity-90">
                  MAP: mouthSmileLeft + mouthSmileRight → AVG
                </span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 w-1 rounded-full ${i === 1 ? "bg-[var(--brand-primary)] shadow-[0_0_8px_var(--brand-primary)]" : "bg-hud-muted opacity-40"}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {blendShapes.map((shape) => (
                <BlendSlider
                  key={shape.name}
                  data={shape}
                  onChange={(v) =>
                    setChannel(
                      shape.name as keyof FacialMappingScores,
                      v
                    )
                  }
                />
              ))}
            </div>

            <button
              type="button"
              onClick={resetData}
              className="brand-gradient-fill group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(224,96,4,0.42)] active:scale-[0.99]"
            >
              <RotateCcw
                size={12}
                className="transition-transform duration-500 group-hover:-rotate-180"
              />
              Reset Simulation Engine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
