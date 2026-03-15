"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function CountUpNumber({
  value,
  duration = 1500,
  suffix = "",
  prefix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, started, value]);

  const formatted = useMemo(
    () => `${prefix}${displayValue.toLocaleString()}${suffix}`,
    [displayValue, prefix, suffix]
  );

  return <span ref={ref}>{formatted}</span>;
}
