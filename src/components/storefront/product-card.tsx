import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  images: string[];
  stockQuantity: number;
  trackInventory: boolean;
};

// HSL triplets (no hsl() wrapper - fed straight into hsl(var(--theme-color) / alpha)
// so the overlay, badge, and bottom bar can all share one themed color).
// There's no per-product color in the data, so the theme is picked from
// the card's own state instead: sale gets the accent red, an unavailable
// product goes neutral, and everything else uses the site's brand blue -
// close matches for --accent/--brand/a muted slate in globals.css.
const THEME_BRAND = "221 70% 40%";
const THEME_ACCENT = "0 72% 51%";
const THEME_MUTED = "220 9% 30%";

// No JS needed here - the card's own hover state drives every effect
// (image zoom, glow shadow, bottom-bar highlight) through CSS alone, so
// this can render as a plain server component instead of shipping a
// mousemove handler to the client for every card in the grid.
export function ProductCard({ product }: { product: ProductCardData }) {
  const outOfStock = product.trackInventory && product.stockQuantity <= 0;
  const image = product.images?.[0];
  const onSale =
    !!product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);

  const themeColor = outOfStock ? THEME_MUTED : onSale ? THEME_ACCENT : THEME_BRAND;

  return (
    <Link
      href={`/products/${product.slug}`}
      style={{ "--theme-color": themeColor } as CSSProperties}
      className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-surface-2 shadow-lg transition-all duration-500 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_50px_-12px_hsl(var(--theme-color)/0.55)]"
    >
      {/* Background image, zooming in slightly on hover */}
      <div className="absolute inset-0">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={cn(
              "object-cover transition-transform duration-500 ease-in-out group-hover:scale-110",
              outOfStock && "grayscale"
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface text-xs text-muted">
            No image
          </div>
        )}
      </div>

      {/* Dark wash, bottom-weighted so the title and action bar stay
          legible over any photo. This stays a fixed near-black rather
          than following --theme-color - tinting the whole bottom half of
          the photo blue (or red on sale) read as a pale color cast
          instead of a moody dark fade, so the theme color is now kept to
          just the accents below (badge, bottom bar, hover glow) where a
          splash of color reads as intentional rather than washing out
          the photo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(8,9,14,0.94), rgba(8,9,14,0.6) 32%, transparent 62%)",
        }}
      />

      {/* Status badge */}
      {(outOfStock || onSale) && (
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm",
            outOfStock ? "bg-black/50" : "bg-[hsl(var(--theme-color)/0.85)]"
          )}
        >
          {outOfStock ? "Out of stock" : "Sale"}
        </span>
      )}

      {/* Content, bottom-anchored */}
      <div className="relative flex h-full flex-col justify-end p-4 text-white sm:p-5">
        <h3 className="line-clamp-2 text-xl font-bold tracking-tight sm:text-2xl">
          {product.name}
        </h3>
        <p className="mt-1 flex items-baseline gap-1.5 text-sm font-medium text-white/85">
          {formatCurrency(product.price)}
          {onSale && (
            <span className="text-xs text-white/60 line-through">
              {formatCurrency(product.compareAtPrice!)}
            </span>
          )}
        </p>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-[hsl(var(--theme-color)/0.35)] bg-[hsl(var(--theme-color)/0.2)] px-3.5 py-2.5 backdrop-blur-md transition-all duration-300 group-hover:border-[hsl(var(--theme-color)/0.5)] group-hover:bg-[hsl(var(--theme-color)/0.4)]">
          <span className="text-sm font-semibold tracking-wide">
            {outOfStock ? "Notify me" : "View product"}
          </span>
          <ArrowRight
            className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}
