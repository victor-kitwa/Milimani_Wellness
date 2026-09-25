"use client";

import { motion, type Variants } from "framer-motion";
import { MessageCircle, MapPin, Phone, ArrowUpRight, HelpCircle } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const helpTopics = [
  "Order status & tracking",
  "Product advice",
  "Delivery & payment questions",
  "Returns & exchanges",
];

// Formats a bare digit string like "254712345678" as "+254 712 345 678" for
// display; falls back to the raw digits if the shape isn't what we expect,
// so a differently-formatted STORE_WHATSAPP_NUMBER still renders sensibly.
function formatPhone(digits: string) {
  const clean = digits.replace(/\D/g, "");
  if (clean.length !== 12) return `+${clean}`;
  return `+${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
}

export function ContactSection({
  storeName,
  whatsappNumber,
}: {
  storeName: string;
  whatsappNumber?: string;
}) {
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;
  const displayPhone = whatsappNumber ? formatPhone(whatsappNumber) : null;

  return (
    <div className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <motion.span
          custom={0}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand"
        >
          Get in touch
        </motion.span>
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl"
        >
          We&apos;re happy to help
        </motion.h1>
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          className="mt-4 leading-relaxed text-muted-foreground"
        >
          Got a question about an order, a product, or delivery? {storeName} is a
          WhatsApp-first team, message us and we&apos;ll get back to you.
        </motion.p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
        {whatsappHref && (
          <motion.a
            custom={0}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg sm:col-span-2"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold text-foreground">Chat on WhatsApp</span>
            <span className="text-sm text-muted-foreground">
              The fastest way to reach us, for order help, product questions, or
              delivery updates.
            </span>
            <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
              Start a conversation
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </span>
          </motion.a>
        )}

        {displayPhone && (
          <motion.a
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            href={`tel:+${whatsappNumber}`}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Phone className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-base font-bold text-foreground">Call us</span>
            <span className="text-sm text-muted-foreground">{displayPhone}</span>
          </motion.a>
        )}

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-bold text-foreground">Based in</span>
          <span className="text-sm text-muted-foreground">
            Nairobi, Kenya, delivering countrywide.
          </span>
        </motion.div>
      </div>

      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-surface p-6 sm:p-8"
      >
        <div className="mb-4 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-brand" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">What we can help with</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {helpTopics.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              {topic}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
