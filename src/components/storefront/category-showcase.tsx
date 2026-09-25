"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { iconFor } from "@/lib/category-icon";

export type CategoryCardData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

// Spring-bounce reveal as each card scrolls into view, staggered left to
// right / row by row.
const cardVariants = {
  offscreen: { y: 50, opacity: 0 },
  onscreen: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, bounce: 0.4, duration: 0.8, delay: i * 0.08 },
  }),
};

export function CategoryShowcase({ categories }: { categories: CategoryCardData[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-surface py-14 sm:py-20">
      <div className="container-page">
        <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
          Shop by category
        </h2>
        <p className="mb-8 max-w-2xl text-muted-foreground">
          Everything you need for a balanced routine, organized so you can find
          it fast.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const Icon = iconFor(c.name);
            return (
              <motion.div
                key={c.id}
                custom={i}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.4 }}
                variants={cardVariants}
              >
                <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
                      {c.imageUrl ? (
                        <Image
                          src={c.imageUrl}
                          alt={c.name}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-brand-soft">
                          <Icon className="h-10 w-10 text-brand" aria-hidden="true" />
                        </div>
                      )}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
                      />
                      <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 shadow-md backdrop-blur-sm">
                        <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-1.5 p-5">
                      <h3 className="text-lg font-bold text-foreground">{c.name}</h3>
                      {c.description && (
                        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
                          {c.description}
                        </p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                        Shop now
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
