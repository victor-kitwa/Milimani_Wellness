import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, LayoutDashboard, Search } from "lucide-react";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { isStoreStaff } from "@/lib/permissions";
import { getCartWithItems } from "@/lib/cart";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MobileNav } from "@/components/storefront/mobile-nav";
import { ShopMenu } from "@/components/storefront/shop-menu";

export async function SiteHeader() {
  const [topCategories, session, cart] = await Promise.all([
    db
      .select({ id: categories.id, name: categories.name, slug: categories.slug })
      .from(categories)
      .where(and(eq(categories.isActive, true), isNull(categories.parentId)))
      .limit(6),
    getSession(),
    getCartWithItems(),
  ]);

  const storeName = process.env.STORE_NAME || "Milimani Wellness Center";

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-card/60 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-card/50">
      <div className="container-page flex h-16 items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/milimani-logo.jpg"
            alt={storeName}
            width={40}
            height={40}
            priority
            className="rounded-md"
          />
          <span className="hidden sm:inline text-base font-bold text-foreground leading-tight">
            Milimani<br />
            <span className="text-xs font-medium text-muted-foreground tracking-wide">
              Wellness Center
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/" className="py-2 hover:text-brand">
            Home
          </Link>
          <ShopMenu categories={topCategories} />
          <Link href="/#about" className="py-2 hover:text-brand">
            About
          </Link>
          <Link href="/contact" className="py-2 hover:text-brand">
            Contact us
          </Link>
        </nav>

        <form action="/search" className="ml-auto hidden sm:flex items-center flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              name="q"
              placeholder="Search products..."
              className="h-10 w-full rounded-lg border border-border bg-surface text-foreground placeholder:text-muted pl-9 pr-3 text-sm outline-none focus:border-brand"
            />
          </div>
        </form>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <MobileNav categories={topCategories} />
          <ThemeToggle />
          {session && isStoreStaff(session) && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand"
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin
            </Link>
          )}
          <Link
            href={session ? "/account" : "/login"}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{session ? session.name.split(" ")[0] : "Sign in"}</span>
          </Link>
          <Link href="/cart" className="relative flex items-center text-muted-foreground hover:text-brand">
            <ShoppingCart className="h-5 w-5" />
            {cart.itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                {cart.itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
