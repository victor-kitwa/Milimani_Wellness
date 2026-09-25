import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/db";
import { products, productVariants, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProductPurchasePanel } from "@/components/storefront/product-purchase-panel";

type Params = { slug: string };

async function getProduct(slug: string) {
  const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!product) return null;
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, product.id));
  const category = product.categoryId
    ? (await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1))[0]
    : null;
  return { product, variants, category };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return {};
  return {
    title: data.product.seoTitle || data.product.name,
    description: data.product.seoDescription || data.product.description?.slice(0, 160),
    openGraph: data.product.images?.[0] ? { images: [data.product.images[0]] } : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data || !data.product.isActive) notFound();
  const { product, variants, category } = data;

  return (
    <div className="container-page py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-brand">Home</Link>
        {category && (
          <>
            {" / "}
            <Link href={`/category/${category.slug}`} className="hover:text-brand">
              {category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">No image</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img) => (
                <div key={img} className="relative aspect-square overflow-hidden rounded-lg bg-surface">
                  <Image src={img} alt={product.name} fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
          {product.description && (
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{product.description}</p>
          )}

          <div className="mt-6">
            <ProductPurchasePanel
              productId={product.id}
              basePrice={product.price}
              trackInventory={product.trackInventory}
              productStock={product.stockQuantity}
              variants={variants.map((v) => ({
                id: v.id,
                name: v.name,
                options: v.options,
                price: v.price,
                stockQuantity: v.stockQuantity,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
