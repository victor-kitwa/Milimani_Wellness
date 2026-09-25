import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import {
  MessageCircle,
  MapPin,
  Truck,
  Smartphone,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

const trustItems = [
  { icon: Smartphone, label: "M-Pesa, card & cash on delivery" },
  { icon: Truck, label: "Countrywide delivery" },
  { icon: ShieldCheck, label: "Genuine products only" },
  { icon: MapPin, label: "Curated in Nairobi" },
];

export async function SiteFooter() {
  const storeName = process.env.STORE_NAME || "Milimani Wellness Center";
  const whatsapp = process.env.STORE_WHATSAPP_NUMBER;

  const topCategories = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(and(eq(categories.isActive, true), isNull(categories.parentId)))
    .limit(6);

  return (
    <footer className="relative mt-16 overflow-hidden rounded-t-[2rem] border-t border-border bg-surface sm:rounded-t-[2.5rem]">
      <div aria-hidden="true" className="h-1 w-full bg-gradient-to-r from-brand via-accent to-brand" />

      <div className="container-page py-14 sm:py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/milimani-logo.jpg"
                alt={storeName}
                width={40}
                height={40}
                className="rounded-md"
              />
              <span className="text-lg font-bold leading-tight text-foreground">
                Milimani
                <br />
                <span className="text-xs font-medium tracking-wide text-muted-foreground">
                  Wellness Center
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Wellness products for a healthier you, curated in Nairobi and
              delivered across Kenya.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
              Nairobi, Kenya
            </p>
          </div>

          {/* Shop */}
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold text-foreground">Shop</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="transition-colors hover:text-brand">
                  All products
                </Link>
              </li>
              {topCategories.map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}`} className="transition-colors hover:text-brand">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold text-foreground">Account</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/cart" className="transition-colors hover:text-brand">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/account" className="transition-colors hover:text-brand">
                  My account
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-brand">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/search" className="transition-colors hover:text-brand">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Help card */}
          <div className="col-span-2 lg:col-span-3">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground">Need a hand?</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Message us on WhatsApp for product advice, order help, or
                delivery questions.
              </p>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Chat on WhatsApp
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-border pt-8 sm:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium leading-tight text-foreground/80">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <p>Made for wellness shoppers across Kenya.</p>
        </div>
      </div>
    </footer>
  );
}
