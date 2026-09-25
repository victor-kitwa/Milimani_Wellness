"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { iconFor } from "@/lib/category-icon";

export type ShopMenuCategory = { id: string; name: string; slug: string };

/*
 * "Shop" in the main nav: clicking it goes straight to /products, and
 * hovering (or focusing, for keyboard users) reveals a dropdown of quick
 * category filters underneath. A short close delay stops the panel from
 * flickering shut while the pointer crosses the small gap between the
 * trigger and the panel.
 */
export function ShopMenu({ categories }: { categories: ShopMenuCategory[] }) {
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  React.useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <Link
        href="/products"
        onClick={() => setOpen(false)}
        onFocus={openNow}
        onBlur={closeSoon}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 py-2 hover:text-brand"
      >
        Shop
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </Link>

      <AnimatePresence>
        {open && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={openNow}
            onMouseLeave={closeSoon}
            className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 border-b border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface hover:text-brand"
              >
                <LayoutGrid className="h-4 w-4 text-brand" aria-hidden="true" />
                All products
              </Link>
              <div className="flex flex-col py-1.5">
                {categories.map((c) => {
                  const Icon = iconFor(c.name);
                  return (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:bg-surface hover:text-brand"
                    >
                      <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
                      {c.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
