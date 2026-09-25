import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Badge, Card } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { deleteProduct, toggleProductActive } from "@/server/admin-catalog-actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { requireAdminPagePermission } from "@/lib/auth";
import { Plus, Pencil, Eye, EyeOff, Trash2 } from "lucide-react";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  await requireAdminPagePermission("manageProducts");
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      images: products.images,
      stockQuantity: products.stockQuantity,
      trackInventory: products.trackInventory,
      isActive: products.isActive,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Products ({rows.length})</h1>
        <ButtonLink href="/admin/products/new">
          <Plus className="h-4 w-4" /> Add product
        </ButtonLink>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border bg-surface text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface">
                      {p.images?.[0] && (
                        <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <span className="font-medium text-foreground hover:text-brand">{p.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.categoryName ?? "—"}</td>
                <td className="px-4 py-3 text-foreground">{formatCurrency(p.price)}</td>
                <td className="px-4 py-3">
                  {p.trackInventory ? (
                    <span className={p.stockQuantity <= 0 ? "text-danger" : "text-foreground"}>
                      {p.stockQuantity}
                    </span>
                  ) : (
                    <span className="text-muted">Not tracked</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={p.isActive ? "success" : "neutral"}>{p.isActive ? "Live" : "Hidden"}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/admin/products/${p.id}`}
                      aria-label="Edit"
                      title="Edit"
                      className="rounded-md p-1.5 text-brand transition-colors hover:bg-brand/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form action={toggleProductActive}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="isActive" value={String(p.isActive)} />
                      <button
                        type="submit"
                        aria-label={p.isActive ? "Hide" : "Show"}
                        title={p.isActive ? "Hide" : "Show"}
                        className={
                          p.isActive
                            ? "rounded-md p-1.5 text-warning transition-colors hover:bg-warning-soft"
                            : "rounded-md p-1.5 text-success transition-colors hover:bg-success-soft"
                        }
                      >
                        {p.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </form>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`Delete "${p.name}"? This can't be undone.`}
                        aria-label="Delete"
                        title="Delete"
                        className="rounded-md p-1.5 text-danger transition-colors hover:bg-danger-soft"
                      >
                        <Trash2 className="h-4 w-4" />
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">No products yet.</p>
        )}
      </Card>
    </div>
  );
}
