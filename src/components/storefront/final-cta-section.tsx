"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { FloatingWellnessDecor, type FloatingIcon } from "@/components/ui/floating-wellness-decor";
import { FluidFieldBackground } from "@/components/ui/fluid-field-background";

const CTA_DECOR: FloatingIcon[] = [
  { icon: "sparkles", className: "top-6 left-[10%] h-16 w-16 sm:h-20 sm:w-20", duration: 9, delay: 0 },
  { icon: "flower", className: "bottom-2 right-[8%] h-24 w-24 sm:h-32 sm:w-32", duration: 12, delay: 1.2 },
  { icon: "leaf", className: "bottom-10 left-[35%] hidden h-10 w-10 sm:block", duration: 7, delay: 0.8 },
  { icon: "ring", className: "top-1/2 right-[30%] hidden h-14 w-14 sm:block", duration: 12, delay: 0.5 },
];

export function FinalCtaSection({
  whatsappHref,
  productCount,
}: {
  whatsappHref: string | null;
  productCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-brand/10 to-background py-16 sm:py-20">
      <FloatingWellnessDecor icons={CTA_DECOR} />
      <div className="container-page">
        {/* Lifted onto its own card, same "shadow does the separating"
            fix used for the admin dashboard's light-theme cards - the
            gradient wash alone read too flat against the surrounding
            sections, so this now sits as a distinct panel on top of it. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-border bg-card/90 px-6 py-12 text-center shadow-lg backdrop-blur sm:rounded-[2.5rem] sm:px-12 sm:py-16"
        >
          <FluidFieldBackground
            tones={[
              { className: "-left-16 -top-16 h-64 w-64", color: "bg-brand/25", duration: 12 },
              { className: "-bottom-16 -right-16 h-64 w-64", color: "bg-accent/20", duration: 15, delay: 1.5 },
              { className: "left-1/3 top-1/2 h-48 w-48", color: "bg-success/15", duration: 18, delay: 3 },
            ]}
          />

          <span className="relative inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Start today
          </span>

          <h2 className="relative mt-4 text-2xl font-bold text-foreground sm:text-3xl">
            Ready to feel your best?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-muted-foreground">
            Browse our full range of wellness essentials, or chat with our team on
            WhatsApp if you would like a hand choosing the right products for you.
          </p>

          {productCount > 0 && (
            <p className="relative mt-4 text-sm font-medium text-brand">
              {productCount} wellness product{productCount === 1 ? "" : "s"} ready to explore
            </p>
          )}

          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="#shop" size="lg" variant="gradient">
              Shop wellness products
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            {whatsappHref && (
              <ButtonLink href={whatsappHref} size="lg" variant="outline">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Chat with us on WhatsApp
              </ButtonLink>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
