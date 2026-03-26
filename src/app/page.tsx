"use client";
import { useState } from 'react';
import FaceTracker, { type FaceBlendShapeCategory } from '@/components/FaceTracker';
import Scene3D from '@/components/Scene3D';

export default function FluxFridayPitch() {
  const [liveData, setLiveData] = useState<FaceBlendShapeCategory[]>([]);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
          FACS & APFS Simulator
        </h1>
        <p className="text-gray-400 mt-2 text-lg">The API of Human Emotion</p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: The Camera and AI Engine */}
        <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-2xl">
           <FaceTracker onBlendshapesUpdate={setLiveData} />
        </section>

        {/* Right Side: Facial mapping + 3D viewport */}
        <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-2xl flex flex-col min-h-0">
          <Scene3D currentBlendshapes={liveData} />
        </section>
      </div>
    </main>
  );
}
