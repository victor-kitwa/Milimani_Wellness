"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Leaf, Droplet, Flower2, Sparkles } from "lucide-react";

type IconComponent = React.ComponentType<{ className?: string; strokeWidth?: number }>;

// Plain geometric outlines, alongside the wellness icon glyphs below — just
// a stroked circle, no fill, so it reads as texture rather than a symbol.
function RingOutline({ className, strokeWidth = 1.25 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
    </svg>
  );
}

function RingDashedOutline({ className, strokeWidth = 1.25 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeDasharray="3 2.5"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
    </svg>
  );
}

// The pages that use this live in Server Components, and an icon is a
// component (a forwardRef object), not plain serializable data — passing
// one directly as a prop across the server/client boundary fails ("Only
// plain objects can be passed to Client Components"). So callers pass a
// name string instead, and the lookup into an actual component happens
// here, entirely on the client side of that boundary.
const ICONS: Record<string, IconComponent> = {
  leaf: Leaf,
  droplet: Droplet,
  flower: Flower2,
  sparkles: Sparkles,
  ring: RingOutline,
  "ring-dashed": RingDashedOutline,
};

export type FloatingIconName = keyof typeof ICONS;

export type FloatingIcon = {
  icon: FloatingIconName;
  /** Positioning + size, e.g. "top-10 left-[6%] h-16 w-16". */
  className: string;
  /** Full bob cycle length in seconds. */
  duration?: number;
  /** Stagger so icons don't move in lockstep. */
  delay?: number;
  /** How far it drifts vertically, in px. */
  distance?: number;
  /** Max rotation during the bob, in degrees. */
  rotate?: number;
};

/*
 * A handful of large, faint wellness-themed shapes (leaf, droplet, flower,
 * sparkle icons, plus a couple of plain ring outlines for variety) drifting
 * slowly in a section's background. Kept deliberately quiet: ~5-8% opacity,
 * outline-only, no pointer events, so it reads as texture rather than
 * content. Each section that uses this hand-places its own icons/positions
 * via the `icons` prop rather than sharing one fixed layout, so the effect
 * doesn't feel identical/copy-pasted section to section.
 *
 * The float only plays while the section is on screen: whileInView +
 * viewport once:false means it fades in and starts bobbing on every
 * entry and resets on exit, so it replays each time you scroll it into
 * view in either direction — same behavior as the About section's stat
 * counters, for the same reason (it should feel alive again each time you
 * come back to it, not like it's been running the whole time unseen).
 *
 * Render this as the first child of a `relative overflow-hidden` section
 * wrapper — it fills that wrapper with `absolute inset-0`.
 */
export function FloatingWellnessDecor({ icons }: { icons: FloatingIcon[] }) {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {icons.map(({ icon, className, duration = 10, delay = 0, distance = 14, rotate = 4 }, i) => {
        const Icon = ICONS[icon];
        if (!Icon) return null;

        if (reducedMotion) {
          return (
            <div key={i} className={`absolute text-brand ${className}`}>
              <Icon className="h-full w-full opacity-[0.06]" strokeWidth={1.25} />
            </div>
          );
        }

        return (
          <motion.div
            key={i}
            className={`absolute text-brand ${className}`}
            initial={{ opacity: 0, rotate: 0 }}
            whileInView={{
              opacity: 1,
              y: [0, -distance, 0],
              rotate: [0, rotate, 0],
            }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{
              opacity: { duration: 0.8, delay },
              y: { duration, delay, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration, delay, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Icon className="h-full w-full opacity-[0.06]" strokeWidth={1.25} />
          </motion.div>
        );
      })}
    </div>
  );
}
