import { notFound } from "next/navigation";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CategoryForm } from "@/components/admin/category-create-form";
import { updateCategory } from "@/server/admin-catalog-actions";
import { requireAdminPagePermission } from "@/lib/auth";

export const metadata = { title: "Edit category" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPagePermission("manageCategories");
  const { id } = await params;
  const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!category) notFound();

  const boundAction = updateCategory.bind(null, id);

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-bold text-foreground">Edit category</h1>
      <CategoryForm
        action={boundAction}
        submitLabel="Save changes"
        isEdit
        initial={{
          name: category.name,
          description: category.description ?? "",
          imageUrl: category.imageUrl ?? "",
          isActive: category.isActive,
        }}
      />
    </div>
  );
}
