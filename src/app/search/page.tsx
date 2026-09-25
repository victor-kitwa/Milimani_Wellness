import { db } from "@/db";
import { products } from "@/db/schema";
import { and, eq, ilike, or } from "drizzle-orm";
import { ProductCard } from "@/components/storefront/product-card";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  const results = query
    ? await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.isActive, true),
            or(ilike(products.name, `%${query}%`), ilike(products.description, `%${query}%`))
          )
        )
    : [];

  return (
    <div className="container-page py-10">
      <h1 className="text-xl font-bold text-foreground">
        {query ? `Results for "${query}"` : "Search"}
      </h1>
      {query && results.length === 0 && (
        <p className="mt-6 text-muted-foreground">No products matched your search.</p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
