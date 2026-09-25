import { notFound } from "next/navigation";
import { db } from "@/db";
import { categories, products, productVariants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "@/server/admin-catalog-actions";
import { requireAdminPagePermission } from "@/lib/auth";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPagePermission("manageProducts");
  const { id } = await params;
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) notFound();

  const [allCategories, variants] = await Promise.all([
    db.select({ id: categories.id, name: categories.name }).from(categories),
    db.select().from(productVariants).where(eq(productVariants.productId, id)),
  ]);

  const boundAction = updateProduct.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-foreground">Edit product</h1>
      <ProductForm
        action={boundAction}
        categories={allCategories}
        submitLabel="Save changes"
        initial={{
          name: product.name,
          description: product.description ?? "",
          categoryId: product.categoryId,
          sku: product.sku ?? "",
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          costPrice: product.costPrice,
          trackInventory: product.trackInventory,
          stockQuantity: product.stockQuantity,
          lowStockThreshold: product.lowStockThreshold,
          images: product.images,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
          variants: variants.map((v) => ({
            id: v.id,
            name: v.name,
            optionsText: Object.entries(v.options)
              .map(([k, val]) => `${k}:${val}`)
              .join(", "),
            sku: v.sku ?? "",
            price: v.price ?? "",
            stockQuantity: String(v.stockQuantity),
            imageUrl: v.imageUrl ?? "",
          })),
        }}
      />
    </div>
  );
}
