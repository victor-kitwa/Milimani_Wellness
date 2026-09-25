"use client";

import { motion, type Variants } from "framer-motion";
import { Stethoscope, SunDim, Sprout, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { WavyGlowBackground } from "@/components/ui/wavy-glow-background";

type Tone = "brand" | "accent" | "success";

type Tip = {
  icon: LucideIcon;
  title: string;
  body: string;
  tone: Tone;
};

const TIPS: Tip[] = [
  {
    icon: Stethoscope,
    title: "Consult before combining supplements",
    body: "Talk to a healthcare provider before mixing new supplements with any medication you already take.",
    tone: "brand",
  },
  {
    icon: SunDim,
    title: "Store essential oils away from direct sunlight",
    body: "Heat and light break oils down faster. Keep your bottles in a cool, dark place to protect their potency.",
    tone: "accent",
  },
  {
    icon: Sprout,
    title: "Start slow with new supplement routines",
    body: "Introduce one product at a time so you can tell what is actually working for your body.",
    tone: "success",
  },
];

const TONE_STYLES: Record<Tone, { badge: string; ring: string; glow: string; bar: string }> = {
  brand: {
    badge: "bg-brand text-brand-foreground",
    ring: "ring-brand/15",
    glow: "bg-brand/25",
    bar: "from-brand to-brand/30",
  },
  accent: {
    badge: "bg-accent text-accent-foreground",
    ring: "ring-accent/15",
    glow: "bg-accent/25",
    bar: "from-accent to-accent/30",
  },
  success: {
    badge: "bg-success text-white",
    ring: "ring-success/15",
    glow: "bg-success/25",
    bar: "from-success to-success/30",
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function WellnessTipsSection() {
  return (
    <section className="container-page py-14 sm:py-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface px-6 py-12 sm:rounded-[2.5rem] sm:px-12 sm:py-16">
        {/* Ambient glow blobs, echoing the "who we are" section's visual
            language, now drifting slowly instead of holding still. */}
        <WavyGlowBackground
          blobs={[
            { className: "-left-12 -top-12 h-64 w-64", color: "bg-brand/20", duration: 9 },
            { className: "-bottom-12 -right-12 h-64 w-64", color: "bg-accent/20", duration: 11, delay: 1 },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5 }}
          className="relative mb-10 flex flex-col items-center gap-3 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            Good to know
          </span>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            A few gentle reminders
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Simple habits that help you get the most out of your wellness routine.
          </p>
        </motion.div>

        <div className="relative grid gap-8 sm:grid-cols-3 sm:gap-6">
          {TIPS.map((tip, i) => {
            const tone = TONE_STYLES[tip.tone];
            return (
              <motion.div
                key={tip.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 pt-8 shadow-sm ring-1 transition-shadow duration-300 hover:shadow-lg",
                  tone.ring
                )}
              >
                {/* Clipping lives on this inner layer, not the card itself,
                    so the accent bar and glow stay contained to the rounded
                    corners without also slicing off the icon badge below —
                    it deliberately floats outside this box's top edge. */}
                <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-2xl">
                  {/* Top accent bar */}
                  <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", tone.bar)} />
                  {/* Corner glow, revealed a little more strongly on hover */}
                  <div
                    className={cn(
                      "absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-90",
                      tone.glow
                    )}
                  />
                </div>

                {/* Floating icon badge, overlapping the card's top edge */}
                <div
                  className={cn(
                    "absolute -top-5 left-6 flex h-11 w-11 items-center justify-center rounded-xl shadow-md",
                    tone.badge
                  )}
                >
                  <tip.icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <h3 className="relative pt-1 text-base font-semibold text-foreground">
                  {tip.title}
                </h3>
                <p className="relative text-sm leading-relaxed text-muted-foreground">
                  {tip.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
