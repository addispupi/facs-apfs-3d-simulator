"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

/** Categories from MediaPipe face blendshapes (FACS-style weights). */
export type FaceBlendShapeCategory = {
  categoryName: string;
  score: number;
  displayName?: string;
  index?: number;
};

export type FaceTrackerProps = {
  onBlendshapesUpdate?: (categories: FaceBlendShapeCategory[]) => void;
  /** Called when the model is loaded and the webcam stream is attached. */
  onEngineReady?: () => void;
  /** When false, detection frames stop and video tracks are disabled (frozen feed). */
  isPlaying?: boolean;
  /** CSS zoom scale (1–2.5); does not change video dimensions for MediaPipe. */
  zoom?: number;
  className?: string;
};

export default function FaceTracker({
  onBlendshapesUpdate,
  onEngineReady,
  isPlaying = true,
  zoom = 1,
  className = "",
}: FaceTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onBlendshapesUpdateRef = useRef(onBlendshapesUpdate);
  const onEngineReadyRef = useRef(onEngineReady);
  useLayoutEffect(() => {
    onBlendshapesUpdateRef.current = onBlendshapesUpdate;
  }, [onBlendshapesUpdate]);
  useLayoutEffect(() => {
    onEngineReadyRef.current = onEngineReady;
  }, [onEngineReady]);

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const [engineReady, setEngineReady] = useState(false);

  const predictFrame = useCallback(() => {
    const video = videoRef.current;
    const fm = faceLandmarkerRef.current;
    if (!video || !fm || video.readyState < 2) return;
    const startTimeMs = performance.now();
    const results = fm.detectForVideo(video, startTimeMs);
    if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
      const categories = results.faceBlendshapes[0].categories;
      onBlendshapesUpdateRef.current?.(categories);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1,
      });

      if (cancelled) {
        faceLandmarker.close();
        return;
      }
      faceLandmarkerRef.current = faceLandmarker;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        faceLandmarker.close();
        return;
      }
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      video.srcObject = stream;
      video.muted = true;
      await video.play();

      if (cancelled) return;
      setEngineReady(true);
      onEngineReadyRef.current?.();
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      faceLandmarkerRef.current?.close();
      faceLandmarkerRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // Mount-only: engine + stream must not restart when parent re-renders (blendshape updates).
  }, []);

  useEffect(() => {
    const stream = streamRef.current;
    if (!stream || !engineReady) return;
    stream.getTracks().forEach((t) => {
      t.enabled = isPlaying;
    });
  }, [isPlaying, engineReady]);

  useEffect(() => {
    if (!engineReady) return;

    function loop() {
      rafRef.current = requestAnimationFrame(loop);
      if (!isPlaying) return;
      predictFrame();
    }

    loop();
    return () => cancelAnimationFrame(rafRef.current);
  }, [engineReady, isPlaying, predictFrame]);

  return (
    <div
      className={`relative h-full min-h-[280px] w-full overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        {!isPlaying &&
          engineReady && (
            <span className="pointer-events-none absolute z-10 font-mono text-xs italic tracking-widest text-zinc-600 uppercase">
              Feed Suspended
            </span>
          )}
        <div
          className="h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover [transform:scaleX(-1)]"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 to-transparent" />
      </div>
    </div>
  );
}
