"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Layers, Calendar, ShieldCheck } from "lucide-react";
import { CountUpNumber } from "@/components/ui/count-up";
import { FluidFieldBackground } from "@/components/ui/fluid-field-background";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function AboutSection({
  storeName,
  categoriesCount,
}: {
  storeName: string;
  categoriesCount: number;
}) {
  const stats = [
    { icon: Layers, value: categoriesCount || 6, suffix: "", label: "Curated categories" },
    { icon: Calendar, value: 2024, suffix: "", label: "Founded in Nairobi" },
    { icon: ShieldCheck, value: 100, suffix: "%", label: "Genuine products" },
  ];

  return (
    <section id="about" className="container-page relative overflow-hidden py-16 sm:py-24">
      <FluidFieldBackground />
      <div className="relative grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="flex flex-col gap-6"
        >
          <motion.span
            custom={0}
            variants={fadeUp}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand"
          >
            Our story
          </motion.span>

          <motion.h2
            custom={1}
            variants={fadeUp}
            className="text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl"
          >
            Who we are
          </motion.h2>

          <motion.p custom={2} variants={fadeUp} className="max-w-lg leading-relaxed text-muted-foreground">
            {storeName} is a Kenyan wellness destination built around one simple
            idea: balanced everyday living. We curate supplements, herbal teas,
            essential oils, natural skincare and yoga gear so you can build a
            routine that actually fits your life.
          </motion.p>

          <motion.p custom={3} variants={fadeUp} className="max-w-lg leading-relaxed text-muted-foreground">
            From your morning cup of tea to the oils on your nightstand, every
            product we stock is chosen for quality and purpose. We work with
            trusted suppliers and keep our shelves genuine, because your
            wellness routine deserves nothing less.
          </motion.p>

          <motion.div
            custom={4}
            variants={fadeUp}
            className="mt-2 grid grid-cols-3 gap-4 border-t border-border pt-6"
          >
            {stats.map((s, i) => (
              <div key={s.label} className="flex flex-col gap-1.5">
                <motion.div
                  initial={{ scale: 0, rotate: -20, opacity: 0 }}
                  whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                  viewport={{ once: false, amount: 0.6 }}
                  transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.15 + i * 0.15 }}
                  className="w-fit"
                >
                  <s.icon className="h-4 w-4 text-brand" aria-hidden="true" />
                </motion.div>
                <CountUpNumber
                  value={s.value}
                  suffix={s.suffix}
                  className="text-xl font-bold text-foreground sm:text-2xl"
                />
                <span className="text-xs leading-tight text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center"
        >
          <div className="relative h-[340px] w-[300px] sm:h-[440px] sm:w-[400px]">
            {/* Square photo — the big anchor shot, sits at the back */}
            <motion.div
              whileHover={{ scale: 1.04, rotate: 1.5 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="absolute left-0 top-0 h-[280px] w-[280px] overflow-hidden rounded-[2rem] border border-border shadow-xl transition-shadow duration-300 hover:shadow-2xl sm:h-[360px] sm:w-[360px]"
            >
              {/* Slow continuous "living photo" zoom, mirrors back and forth */}
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1 }}
                animate={{ scale: 1.08 }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1676852148076-7a92002419f3?w=800&h=800&fit=crop&q=80&auto=format"
                  alt="Essential oils, dried lavender and natural botanicals curated by Milimani Wellness Center"
                  fill
                  sizes="(min-width: 640px) 360px, 280px"
                  className="object-cover"
                />
              </motion.div>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
              />
            </motion.div>

            {/* Landscape photo — smaller, sits in front, overlapping the bottom-right corner */}
            <motion.div
              initial={{ rotate: -4 }}
              whileHover={{ scale: 1.08, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="absolute bottom-0 right-0 z-10 h-[150px] w-[230px] translate-x-6 translate-y-6 overflow-hidden rounded-[1.5rem] border-4 border-background shadow-2xl sm:h-[190px] sm:w-[300px] sm:translate-x-8 sm:translate-y-8"
            >
              <Image
                src="https://images.unsplash.com/photo-1633945984522-a19268cc75ad?w=760&h=480&fit=crop&q=80&auto=format"
                alt="A warm cup of herbal tea by a sunlit window, part of a daily wellness ritual"
                fill
                sizes="(min-width: 640px) 300px, 230px"
                className="object-cover"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
