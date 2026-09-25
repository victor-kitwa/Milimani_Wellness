"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type FluidTone = {
  /** Position and size, e.g. "-left-1/4 -top-1/3 h-[32rem] w-[32rem]". */
  className: string;
  /** A background color utility with its own opacity, e.g. "bg-brand/20". */
  color: string;
  duration?: number;
  delay?: number;
};

const DEFAULT_TONES: FluidTone[] = [
  { className: "-left-1/4 -top-1/3 h-[32rem] w-[32rem]", color: "bg-brand/20", duration: 16 },
  { className: "-right-1/4 top-[5%] h-[28rem] w-[28rem]", color: "bg-accent/15", duration: 19, delay: 2 },
  { className: "bottom-[-30%] left-[15%] h-[30rem] w-[30rem]", color: "bg-success/15", duration: 22, delay: 4 },
];

/**
 * A soft, flowing multi-color aura plus a fine grain texture - a
 * lightweight CSS/framer-motion stand-in for a WebGL fluid-noise-shader
 * background (the "fluid field" look), built with no new dependencies.
 * Each tone drifts, scales, and slowly rotates on its own independent
 * loop, so the blend between colors keeps shifting - that continuous
 * re-blending is what reads as "fluid" rather than a simple pulsing
 * blob. brand/accent/success already swap per theme via CSS variables,
 * so this looks right in light and dark mode without extra work.
 *
 * Purely decorative: aria-hidden and pointer-events-disabled, so it
 * never intercepts clicks or gets announced to screen readers. Render it
 * as the first child of a `relative overflow-hidden` section/container -
 * it fills that ancestor via `absolute inset-0`.
 */
export function FluidFieldBackground({
  tones = DEFAULT_TONES,
  className,
}: {
  tones?: FluidTone[];
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {tones.map((tone, i) => (
        <motion.div
          key={i}
          className={cn("absolute rounded-full blur-[90px]", tone.color, tone.className)}
          animate={{
            x: [0, 70, -55, 30, 0],
            y: [0, -55, 45, -20, 0],
            scale: [1, 1.22, 0.85, 1.1, 1],
            rotate: [0, 18, -12, 6, 0],
          }}
          transition={{
            duration: tone.duration ?? 16,
            delay: tone.delay ?? 0,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Fine grain, the same technique as the sign-in card's noise
          overlay (a tiny inline SVG turbulence filter, no network
          request) - keeps the aura reading as textured light rather than
          a flat gradient blur. */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />
    </div>
  );
}
