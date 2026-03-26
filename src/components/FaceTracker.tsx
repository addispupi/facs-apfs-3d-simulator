"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

/** Categories from MediaPipe face blendshapes (FACS-style weights). */
export type FaceBlendShapeCategory = {
  categoryName: string;
  score: number;
  displayName?: string;
  index?: number;
};

type FaceTrackerProps = {
  onBlendshapesUpdate?: (categories: FaceBlendShapeCategory[]) => void;
};

export default function FluxFridayFaceTracker({
  onBlendshapesUpdate,
}: FaceTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onBlendshapesUpdateRef = useRef(onBlendshapesUpdate);
  useLayoutEffect(() => {
    onBlendshapesUpdateRef.current = onBlendshapesUpdate;
  }, [onBlendshapesUpdate]);

  const [blendshapes, setBlendshapes] = useState<FaceBlendShapeCategory[]>([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    let faceLandMarker: FaceLandmarker;
    let animationFrameId: number;

    const initializeAI = async () => {
      // 1. Load the WebAssembly files and the AI Model
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      faceLandMarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU" // Let the GPU do the heavy lifting!
        },
        outputFaceBlendshapes: true, // This is the FACS magic switch
        runningMode: "VIDEO",
        numFaces: 1,
      });

      setIsModelLoaded(true);
      startWebcam();
    };

    const startWebcam = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
      }
    };

    const predictWebcam = () => {
      if (videoRef.current && faceLandMarker) {
        const startTimeMs = performance.now();
        // 2. Feed the video frame to the AI
        const results = faceLandMarker.detectForVideo(videoRef.current, startTimeMs);

        // 3. Extract the FACS Blendshapes if a face is detected
        if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
          const categories = results.faceBlendshapes[0].categories;
          setBlendshapes(categories);
          onBlendshapesUpdateRef.current?.(categories);
        }

        // Keep looping
        animationFrameId = requestAnimationFrame(predictWebcam);
      }
    };

    initializeAI();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (faceLandMarker) faceLandMarker.close();
    };
  }, []);

  // Filter for the fun ones to show the audience
  const trackedAUs = ["mouthSmileLeft", "mouthSmileRight", "browInnerUp", "browDownLeft", "eyeBlinkLeft"];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4 text-cyan-400">The API of Human Emotion</h1>
      {!isModelLoaded && <p className="animate-pulse text-yellow-400">Loading APFS/FACS Engine...</p>}
      
      <div className="flex flex-row gap-8 w-full max-w-5xl">
        {/* The Video Feed */}
        <div className="flex-1 relative rounded-xl overflow-hidden border-4 border-cyan-500 shadow-2xl shadow-cyan-500/50">
          {/* Mirror horizontally so movement matches the user */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto transform scale-x-[-1]"
          />
        </div>

        {/* The Live Data Console */}
        <div className="flex-1 bg-black p-6 rounded-xl font-mono text-sm border border-gray-700 overflow-y-auto max-h-[500px]">
          <h2 className="text-green-400 mb-4 border-b border-gray-700 pb-2">
            {"// Live FACS Variables"}
          </h2>
          {blendshapes.length === 0 ? (
            <p className="text-gray-500">Waiting for a face...</p>
          ) : (
            <ul>
              {blendshapes
                .filter(shape => trackedAUs.includes(shape.categoryName))
                .map((shape) => (
                  <li key={shape.categoryName} className="mb-2 flex justify-between">
                    <span className="text-pink-400">{shape.categoryName}:</span>
                    <span className="text-blue-400">
                      {/* Format to 3 decimal places for that matrix feel */}
                      {shape.score.toFixed(3)}
                    </span>
                  </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
