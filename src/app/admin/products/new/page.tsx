import { db } from "@/db";
import { categories } from "@/db/schema";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/server/admin-catalog-actions";
import { requireAdminPagePermission } from "@/lib/auth";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  await requireAdminPagePermission("manageProducts");
  const allCategories = await db.select({ id: categories.id, name: categories.name }).from(categories);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-foreground">Add product</h1>
      <ProductForm action={createProduct} categories={allCategories} submitLabel="Create product" />
    </div>
  );
}
