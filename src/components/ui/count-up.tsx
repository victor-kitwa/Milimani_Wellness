"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

/*
 * Animates a number counting up from 0 to `value` every time it scrolls
 * into view (scrolling away and back replays it, in either direction) —
 * it resets to 0 while off-screen so each re-entry starts the count over
 * rather than jumping from the old value. Skips the animation entirely
 * for prefers-reduced-motion and just shows the final value when in view,
 * matching the a11y guard used elsewhere on this site (custom cursor,
 * product card tilt).
 */
export function CountUpNumber({
  value,
  suffix = "",
  duration = 1.4,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) {
      setDisplay(0);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
