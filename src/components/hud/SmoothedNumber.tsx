"use client";

import { useMotionValue, useMotionValueEvent, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/** Spring-smoothed numeric display to reduce high-frequency jitter from the tracker. */
export function SmoothedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const target = useMotionValue(value);
  const spring = useSpring(target, { stiffness: 180, damping: 28 });

  useEffect(() => {
    target.set(value);
  }, [value, target]);

  const [display, setDisplay] = useState(value);
  useMotionValueEvent(spring, "change", (v) => setDisplay(v));

  return (
    <span className={className ?? "tabular-nums"}>{display.toFixed(2)}</span>
  );
}
