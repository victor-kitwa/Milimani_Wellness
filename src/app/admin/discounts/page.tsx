import Link from "next/link";
import { db } from "@/db";
import { discountCodes } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Badge, Card } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { DiscountForm } from "@/components/admin/discount-create-form";
import { formatCurrency } from "@/lib/utils";
import { createDiscount, toggleDiscountActive, deleteDiscount } from "@/server/admin-discount-actions";
import { requireAdminPagePermission } from "@/lib/auth";
import { Pencil, Eye, EyeOff, Trash2 } from "lucide-react";

export const metadata = { title: "Discount codes" };

export default async function AdminDiscountsPage() {
  await requireAdminPagePermission("manageDiscounts");
  const rows = await db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-6 text-xl font-bold text-foreground">Discount codes ({rows.length})</h1>
        <Card className="divide-y divide-border">
          {rows.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-mono font-semibold text-foreground">{d.code}</p>
                <p className="text-xs text-muted-foreground">
                  {d.type === "percentage" ? `${d.value}% off` : `${formatCurrency(d.value)} off`}
                  {d.minOrderAmount ? ` · min ${formatCurrency(d.minOrderAmount)}` : ""}
                  {d.usageLimit ? ` · ${d.usageCount}/${d.usageLimit} used` : ` · ${d.usageCount} used`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Badge tone={d.isActive ? "success" : "neutral"}>{d.isActive ? "Active" : "Disabled"}</Badge>
                <Link
                  href={`/admin/discounts/${d.id}`}
                  aria-label="Edit"
                  title="Edit"
                  className="rounded-md p-1.5 text-brand transition-colors hover:bg-brand/10"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <form action={toggleDiscountActive}>
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="isActive" value={String(d.isActive)} />
                  <button
                    type="submit"
                    aria-label={d.isActive ? "Disable" : "Enable"}
                    title={d.isActive ? "Disable" : "Enable"}
                    className={
                      d.isActive
                        ? "rounded-md p-1.5 text-warning transition-colors hover:bg-warning-soft"
                        : "rounded-md p-1.5 text-success transition-colors hover:bg-success-soft"
                    }
                  >
                    {d.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </form>
                <form action={deleteDiscount}>
                  <input type="hidden" name="id" value={d.id} />
                  <ConfirmSubmitButton
                    confirmMessage={`Delete code "${d.code}"?`}
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
            <p className="p-6 text-center text-sm text-muted-foreground">No discount codes yet.</p>
          )}
        </Card>
      </div>

      <div>
        <h2 className="mb-6 text-sm font-semibold text-foreground">Create code</h2>
        <Card className="p-5">
          <DiscountForm action={createDiscount} />
        </Card>
      </div>
    </div>
  );
}
