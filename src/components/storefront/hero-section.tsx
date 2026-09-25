"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { WavyGlowBackground } from "@/components/ui/wavy-glow-background";

/*
 * Milimani hero:
 * - Light theme: warm cream canvas, espresso ink text, cream/tan bottle photo
 * - Dark theme: deep navy canvas, cream text, navy bottle photo
 * - Both themes share the same layout: headline and CTAs on the left,
 *   the bottle photo bleeding across the full section with the product
 *   sitting in the right third, and a theme-tinted gradient over it so
 *   the text stays readable.
 */

const HERO_LIGHT = "#fcf6ec";
const INK_LIGHT = "#2e2521";
const HERO_DARK = "#0b1226"; // deep brand navy
const INK_DARK = "#eef1f7"; // cream on navy

const maskLineVariants: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

// Marquee ticker items for the bottom rail
const TICKER_ITEMS = [
  "M-Pesa · Card · Cash on Delivery",
  "Countrywide delivery",
  "Free delivery over KSh 10,000",
  "Genuine products only",
  "Curated in Nairobi",
  "Since 2024",
];

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        // Base fallback; the [data-theme] override does the theming
        background: HERO_LIGHT,
        color: INK_LIGHT,
      }}
    >
      {/* Theme-aware surface using inline style + CSS attribute selectors
          so we don't have to touch globals.css for hero-only tokens. */}
      <style>{`
        :root[data-theme="dark"] .hero-surface {
          background: ${HERO_DARK} !important;
          color: ${INK_DARK} !important;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .hero-surface {
            background: ${HERO_DARK};
            color: ${INK_DARK};
          }
        }
        .hero-surface .hero-border-light { border-color: rgba(46, 37, 33, 0.25); }
        :root[data-theme="dark"] .hero-surface .hero-border-light {
          border-color: rgba(238, 241, 247, 0.15) !important;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .hero-surface .hero-border-light {
            border-color: rgba(238, 241, 247, 0.15);
          }
        }
        .hero-surface .hero-fill-invert {
          background: ${INK_LIGHT};
          color: ${HERO_LIGHT};
          border-color: ${INK_LIGHT};
        }
        :root[data-theme="dark"] .hero-surface .hero-fill-invert {
          background: ${INK_DARK} !important;
          color: ${HERO_DARK} !important;
          border-color: ${INK_DARK} !important;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .hero-surface .hero-fill-invert {
            background: ${INK_DARK};
            color: ${HERO_DARK};
            border-color: ${INK_DARK};
          }
        }
        .hero-surface .hero-fill-invert-inner {
          background: ${HERO_LIGHT};
          color: ${INK_LIGHT};
        }
        :root[data-theme="dark"] .hero-surface .hero-fill-invert-inner {
          background: ${HERO_DARK} !important;
          color: ${INK_DARK} !important;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .hero-surface .hero-fill-invert-inner {
            background: ${HERO_DARK};
            color: ${INK_DARK};
          }
        }
        /* Photographic bottle backgrounds: one per theme, cross-faded via
           the [data-theme] attribute set before hydration. */
        .hero-surface .hero-photo-bg-light {
          opacity: 1;
          visibility: visible;
          transition: opacity 0.5s ease;
        }
        :root[data-theme="dark"] .hero-surface .hero-photo-bg-light {
          opacity: 0 !important;
          visibility: hidden !important;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .hero-surface .hero-photo-bg-light {
            opacity: 0;
            visibility: hidden;
          }
        }
        .hero-surface .hero-photo-bg-dark {
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.5s ease;
        }
        :root[data-theme="dark"] .hero-surface .hero-photo-bg-dark {
          opacity: 1 !important;
          visibility: visible !important;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .hero-surface .hero-photo-bg-dark {
            opacity: 1;
            visibility: visible;
          }
        }
        /* "wellness" in the headline: a warm gold-to-terracotta gradient
           in the light theme, so it reads as an accent within the cream/
           espresso palette instead of a cool color dropped on top of it.
           The dark theme keeps the brand blue-to-green gradient, which
           already reads well against the deep navy surface. */
        .hero-surface .hero-wellness-gradient {
          background-image: linear-gradient(90deg, #c9962c 0%, #b5651d 55%, #8b3a1f 100%);
        }
        :root[data-theme="dark"] .hero-surface .hero-wellness-gradient {
          background-image: linear-gradient(90deg, var(--brand) 0%, var(--brand-hover) 50%, var(--success) 100%) !important;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .hero-surface .hero-wellness-gradient {
            background-image: linear-gradient(90deg, var(--brand) 0%, var(--brand-hover) 50%, var(--success) 100%);
          }
        }
        @keyframes hero-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes hero-underline-draw {
          0%   { transform: scaleX(0); transform-origin: left; }
          50%  { transform: scaleX(1); transform-origin: left; }
          51%  { transform-origin: right; }
          100% { transform: scaleX(0); transform-origin: right; }
        }
      `}</style>

      <div className="hero-surface relative overflow-hidden">
        <div className="relative overflow-hidden">
          {/* Light theme bottle photo */}
          <div aria-hidden="true" className="hero-photo-bg-light absolute inset-0">
            <Image
              src="/hero-bottle-bg-light.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-contain object-[92%_100%]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(100deg, rgba(252,246,236,0.95) 0%, rgba(252,246,236,0.78) 26%, rgba(252,246,236,0.32) 50%, rgba(252,246,236,0.06) 70%, rgba(252,246,236,0) 85%)",
              }}
            />
          </div>

          {/* Dark theme bottle photo */}
          <div aria-hidden="true" className="hero-photo-bg-dark absolute inset-0">
            <Image
              src="/hero-bottle-bg.png"
              alt=""
              fill
              sizes="100vw"
              className="object-contain object-[92%_100%]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(100deg, rgba(11,18,38,0.96) 0%, rgba(11,18,38,0.82) 28%, rgba(11,18,38,0.4) 52%, rgba(11,18,38,0.05) 72%, rgba(11,18,38,0) 85%)",
              }}
            />
          </div>

          {/* Painted on top of the bottle photo and its wash (not behind
              them - the earlier version sat behind both and the wash is
              up to 95% opaque near the text, so it was invisible there),
              blended so it tints the surface as a moving color wash
              instead of flatly covering it, and still under the text
              content below. brand/accent match the same glow pair used
              on the wellness-tips and final-cta sections, for one
              consistent "drifting glow" signature across the storefront. */}
          <WavyGlowBackground
            className="mix-blend-soft-light"
            blobs={[
              { className: "-left-24 -top-24 h-[28rem] w-[28rem]", color: "bg-brand/40", duration: 11 },
              { className: "-bottom-24 right-0 h-[26rem] w-[26rem]", color: "bg-accent/30", duration: 13, delay: 1 },
            ]}
          />

          <div className="container-page relative grid gap-12 py-10 sm:py-20 lg:grid-cols-12 lg:gap-8 lg:py-24">
            {/* Left: monumental type + CTAs. On mobile this is the only
                grid row (the spacer below is hidden), and it carries its
                own min-height so the bottle photo — already positioned
                behind everything — has a real canvas to show through
                around the text, instead of the text's natural height
                collapsing the row to just the copy. */}
            <div className="flex min-h-[420px] flex-col justify-between gap-10 sm:min-h-[480px] lg:col-span-7 lg:min-h-0">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-[11px] tracking-[0.18em] uppercase font-medium"
                >
                  Natural Wellness, Delivered
                </motion.p>

                {/* Headline: mask-reveal per line */}
                <h1 className="mt-5 max-w-3xl text-[38px] sm:text-[72px] lg:text-[96px] leading-[0.9] font-extrabold tracking-[-0.02em]">
                  <span className="block overflow-hidden">
                    <motion.span
                      variants={maskLineVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.4 }}
                      className="block"
                    >
                      Your everyday
                    </motion.span>
                  </span>
                  <span className="block overflow-hidden">
                    <motion.span
                      variants={maskLineVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.55 }}
                      className="block"
                    >
                      <span className="relative inline-block">
                        {/* Gradient fill instead of the plain ink color, so
                            this one word pops out of the otherwise
                            monochrome headline. bg-clip-text only strips
                            color off this span itself, so the underline
                            below (bg-current, inheriting from the h1)
                            keeps reading as ink in both themes. */}
                        <span className="hero-wellness-gradient italic font-semibold bg-clip-text text-transparent">
                          wellness
                        </span>
                        {/* Ink-flow underline that draws in and back out */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-0 right-0 bottom-[0.12em] block h-[3px] bg-current opacity-70"
                          style={{
                            animation: "hero-underline-draw 4s ease-in-out 1.6s infinite",
                          }}
                        />
                      </span>{" "}
                      ritual.
                    </motion.span>
                  </span>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.9 }}
                  className="mt-6 max-w-md text-sm sm:text-base leading-relaxed"
                >
                  Supplements, herbal teas, essential oils and skincare, curated
                  with care and delivered across Kenya.
                </motion.p>
              </div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.1 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Link
                  href="#shop"
                  className="hero-fill-invert group inline-flex items-center gap-6 rounded-[20px] pl-5 pr-3 py-2.5 text-sm font-medium border transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Shop the collection
                  <span className="hero-fill-invert-inner flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </Link>
                <Link
                  href="#about"
                  className="group inline-flex items-center gap-6 rounded-[20px] bg-transparent pl-5 pr-3 py-2.5 text-sm font-medium border hero-border-light transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Our story
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border hero-border-light transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </Link>
              </motion.div>
            </div>

            {/* Right: reserved space so the bottle in the photo reads clearly
                beside the text, in both themes. Desktop/tablet only — on
                mobile the text column above is the sole grid row, and the
                photo shows through behind it instead of in a separate
                block below. */}
            <div
              aria-hidden="true"
              className="hidden lg:col-span-5 lg:block lg:min-h-[520px]"
            />
          </div>
        </div>

        {/* Bottom marquee rail */}
        <div className="relative border-t hero-border-light py-4 text-[11px] tracking-[0.14em] uppercase font-medium overflow-hidden">
          <div
            className="flex whitespace-nowrap"
            style={{ animation: "hero-marquee 40s linear infinite" }}
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
              <span key={i} className="mx-8 opacity-70">
                {t}
                <span className="mx-8 opacity-40">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
