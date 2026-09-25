"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, ChevronDown, LayoutGrid } from "lucide-react";
import { iconFor } from "@/lib/category-icon";
import { cn } from "@/lib/utils";

export type MobileNavCategory = { id: string; name: string; slug: string };

/*
 * Below the `md` breakpoint the header's page nav and search bar are both
 * hidden (see site-header.tsx), leaving phones with no way to browse the
 * site at all. This renders the hamburger trigger plus a slide-down panel
 * mirroring the desktop nav (Home, an expandable Shop section with the
 * category quick links, About, Contact us), closing on link click, backdrop
 * click, or Esc. Respects prefers-reduced-motion like the rest of the site
 * (product card tilt, count-up numbers, custom cursor).
 */
export function MobileNav({ categories }: { categories: MobileNavCategory[] }) {
  const [open, setOpen] = React.useState(false);
  const [shopOpen, setShopOpen] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Start each opening of the menu with Shop collapsed, rather than
  // remembering whatever state it was left in last time.
  React.useEffect(() => {
    if (!open) setShopOpen(false);
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  const panelTransition = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 320, damping: 28 };
  const navLinkClass =
    "rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface hover:text-brand";

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-brand"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <React.Fragment key="mobile-nav">
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              className="fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-[2px]"
              onClick={closeMenu}
              aria-hidden="true"
            />
            <motion.div
              key="panel"
              id="mobile-nav-panel"
              role="dialog"
              aria-label="Site menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={panelTransition}
              className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-card/95 shadow-xl backdrop-blur-xl"
            >
              <div className="container-page flex flex-col gap-5 py-5">
                <form action="/search" onSubmit={closeMenu} className="flex items-center">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      name="q"
                      placeholder="Search products..."
                      className="h-11 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-brand"
                    />
                  </div>
                </form>

                <nav aria-label="Main" className="flex flex-col gap-1">
                  <Link href="/" onClick={closeMenu} className={navLinkClass}>
                    Home
                  </Link>

                  <div>
                    <button
                      type="button"
                      onClick={() => setShopOpen((v) => !v)}
                      aria-expanded={shopOpen}
                      aria-controls="mobile-shop-panel"
                      className={cn("flex w-full items-center justify-between", navLinkClass)}
                    >
                      Shop
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted transition-transform duration-200",
                          shopOpen && "rotate-180"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {shopOpen && (
                        <motion.div
                          id="mobile-shop-panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <Link
                            href="/products"
                            onClick={closeMenu}
                            className="flex items-center gap-2.5 py-2.5 pl-8 pr-4 text-sm text-muted-foreground hover:text-brand"
                          >
                            <LayoutGrid className="h-4 w-4 text-brand" aria-hidden="true" />
                            All products
                          </Link>
                          {categories.map((c) => {
                            const Icon = iconFor(c.name);
                            return (
                              <Link
                                key={c.id}
                                href={`/category/${c.slug}`}
                                onClick={closeMenu}
                                className="flex items-center gap-2.5 py-2.5 pl-8 pr-4 text-sm text-muted-foreground hover:text-brand"
                              >
                                <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
                                {c.name}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link href="/#about" onClick={closeMenu} className={navLinkClass}>
                    About
                  </Link>
                  <Link href="/contact" onClick={closeMenu} className={navLinkClass}>
                    Contact us
                  </Link>
                </nav>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
}
