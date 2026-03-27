"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import CameraPanel from "@/components/CameraPanel";
import type { FaceBlendShapeCategory } from "@/components/FaceTracker";
import Scene3D from "@/components/Scene3D";
import { SystemStatus } from "@/components/SystemStatus";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function FacsSimulatorPage() {
  const [liveData, setLiveData] = useState<FaceBlendShapeCategory[]>([]);
  const [latencyMs, setLatencyMs] = useState(12);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLatencyMs(8 + Math.floor(Math.random() * 9));
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  const hasFace = liveData.length > 0;

  return (
    <>
      <ThemeSwitcher />
      <main className="min-h-screen bg-[var(--background)] p-6 font-sans text-[var(--foreground)] selection:bg-[var(--selection)] md:p-12">
        <header className="mx-auto mb-10 grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2 lg:items-end lg:gap-8">
          <div className="min-w-0 pr-20 sm:pr-24 md:pr-28 lg:pr-0">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tighter"
            >
              <span className="brand-gradient-text italic">
                FACS & APFS{" "}
                <span className="font-light not-italic">SIMULATOR</span>
              </span>
            </motion.h1>
            <p className="brand-gradient-text mt-2 text-[10px] font-bold tracking-[0.4em] uppercase">
              The API of Human Emotion
            </p>
          </div>
          <div className="hidden min-w-0 justify-self-end lg:block">
            <SystemStatus latencyMs={latencyMs} />
          </div>
        </header>

        <div className="mx-auto grid min-h-[640px] max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
          <CameraPanel
            onBlendshapesUpdate={setLiveData}
            hasFace={hasFace}
          />

          <section className="flex min-h-0 flex-col">
            <Scene3D currentBlendshapes={liveData} />
          </section>
        </div>
      </main>
    </>
  );
}
