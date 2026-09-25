"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  /** Duration in seconds for one full cycle. Higher = slower. */
  speed?: number;
  /** Duration in seconds when hovered. Lower than `speed` = speeds up on hover. */
  speedOnHover?: number;
  className?: string;
  gap?: number;
  /** Run the loop in the opposite direction (useful for alternating rows). */
  reverse?: boolean;
};

/**
 * A minimal infinite-loop marquee. Content is duplicated once and the
 * container is translated by -50% over `speed` seconds, then linearly
 * repeated. Supports both horizontal and vertical directions.
 */
export function InfiniteSlider({
  children,
  direction = "horizontal",
  speed = 40,
  speedOnHover,
  className,
  gap = 24,
  reverse = false,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const duration = hovered && speedOnHover != null ? speedOnHover : speed;
  const isVertical = direction === "vertical";
  const from = reverse ? "-50%" : "0%";
  const to = reverse ? "0%" : "-50%";

  return (
    <div
      className={cn("overflow-hidden", className)}
      onMouseEnter={() => speedOnHover != null && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className={cn("flex", isVertical ? "flex-col" : "flex-row")}
        style={{ gap: `${gap}px` }}
        animate={
          isVertical
            ? { y: [from, to] }
            : { x: [from, to] }
        }
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        {children}
        {/* Duplicate for seamless loop */}
        <div className={cn("shrink-0 flex", isVertical ? "flex-col" : "flex-row")} style={{ gap: `${gap}px` }} aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
