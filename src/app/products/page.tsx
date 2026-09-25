import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { ProductCard } from "@/components/storefront/product-card";
import Link from "next/link";

export const metadata = { title: "All products" };

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;

  const allCategories = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.isActive, true));

  const activeCategory = categorySlug
    ? allCategories.find((c) => c.slug === categorySlug)
    : null;

  const items = activeCategory
    ? await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.isActive, true),
            eq(products.categoryId, activeCategory.id)
          )
        )
        .orderBy(desc(products.createdAt))
    : await db
        .select()
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(desc(products.createdAt));

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-foreground">
        {activeCategory ? activeCategory.name : "All products"}
      </h1>
      <p className="mt-1 text-muted-foreground">
        Browse our full range of wellness essentials.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            !activeCategory
              ? "bg-foreground text-background"
              : "bg-surface text-muted-foreground hover:text-brand"
          }`}
        >
          All
        </Link>
        {allCategories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              activeCategory?.id === c.id
                ? "bg-foreground text-background"
                : "bg-surface text-muted-foreground hover:text-brand"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No products to show yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
