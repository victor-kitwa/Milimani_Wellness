import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { Card } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { CategoryForm } from "@/components/admin/category-create-form";
import { createCategory, deleteCategory } from "@/server/admin-catalog-actions";
import { requireAdminPagePermission } from "@/lib/auth";
import { Pencil, Trash2 } from "lucide-react";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireAdminPagePermission("manageCategories");
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.sortOrder);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-6 text-xl font-bold text-foreground">Categories ({rows.length})</h1>
        <Card className="divide-y divide-border">
          {rows.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">/{c.slug} · {c.productCount} product{c.productCount === 1 ? "" : "s"}</p>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/categories/${c.id}`}
                  aria-label="Edit"
                  title="Edit"
                  className="rounded-md p-1.5 text-brand transition-colors hover:bg-brand/10"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmSubmitButton
                    confirmMessage={`Delete "${c.name}"? Products in it will become uncategorised.`}
                    aria-label="Delete"
                    title="Delete"
                    className="rounded-md p-1.5 text-danger transition-colors hover:bg-danger-soft"
                  >
                    <Trash2 className="h-4 w-4" />
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">No categories yet.</p>
          )}
        </Card>
      </div>

      <div>
        <h2 className="mb-6 text-sm font-semibold text-foreground">Add category</h2>
        <Card className="p-5">
          <CategoryForm action={createCategory} />
        </Card>
      </div>
    </div>
  );
}
