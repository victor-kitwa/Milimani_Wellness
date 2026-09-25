"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type GlowBlob = {
  /** Position and size, e.g. "-left-16 -top-16 h-64 w-64". */
  className: string;
  /** A background color utility with its own opacity, e.g. "bg-brand/10". */
  color: string;
  duration?: number;
  delay?: number;
};

/**
 * A field of blurred, slowly-drifting gradient blobs behind a section's
 * content. This is the site's existing "ambient glow" look (see the
 * static corner blobs on the wellness-tips and final-cta sections)
 * turned into a slow, continuous drift instead of holding still - each
 * blob wanders and breathes on its own loop, giving the background a
 * gentle, fluid, wave-like motion without ever competing with the
 * foreground copy for attention.
 *
 * Purely decorative: aria-hidden and pointer-events-disabled, so it
 * never intercepts clicks or gets announced to screen readers. Render it
 * as the first child of a `relative overflow-hidden` section/container -
 * it fills that ancestor via `absolute inset-0`.
 */
export function WavyGlowBackground({
  blobs,
  className,
}: {
  blobs: GlowBlob[];
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={cn("absolute rounded-full blur-3xl", blob.color, blob.className)}
          animate={{
            // Wide enough that the drift reads as motion at a glance
            // instead of needing a stopwatch to notice - roughly a third
            // of a typical blob's own size, plus a scale pulse so it
            // breathes as it wanders.
            x: [0, 60, -45, 20, 0],
            y: [0, -50, 35, -15, 0],
            scale: [1, 1.18, 0.88, 1.08, 1],
          }}
          transition={{
            duration: blob.duration ?? 10,
            delay: blob.delay ?? 0,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
