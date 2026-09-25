import { notFound } from "next/navigation";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ProductCard } from "@/components/storefront/product-card";
import type { Metadata } from "next";

type Params = { slug: string };

async function getCategory(slug: string) {
  const [category] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return category ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description || `Shop ${category.name}`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category || !category.isActive) notFound();

  const items = await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, category.id), eq(products.isActive, true)));

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
      {category.description && <p className="mt-1 text-muted-foreground">{category.description}</p>}

      {items.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No products in this category yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
