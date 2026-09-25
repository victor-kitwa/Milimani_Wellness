import { notFound } from "next/navigation";
import { db } from "@/db";
import { discountCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DiscountForm } from "@/components/admin/discount-create-form";
import { updateDiscount } from "@/server/admin-discount-actions";
import { requireAdminPagePermission } from "@/lib/auth";

export const metadata = { title: "Edit discount code" };

function toDateInputValue(value: Date | null): string {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

export default async function EditDiscountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPagePermission("manageDiscounts");
  const { id } = await params;
  const [discount] = await db.select().from(discountCodes).where(eq(discountCodes.id, id)).limit(1);
  if (!discount) notFound();

  const boundAction = updateDiscount.bind(null, id);

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-bold text-foreground">Edit discount code</h1>
      <DiscountForm
        action={boundAction}
        submitLabel="Save changes"
        isEdit
        initial={{
          code: discount.code,
          type: discount.type,
          value: discount.value,
          minOrderAmount: discount.minOrderAmount ?? "",
          usageLimit: discount.usageLimit != null ? String(discount.usageLimit) : "",
          startsAt: toDateInputValue(discount.startsAt),
          expiresAt: toDateInputValue(discount.expiresAt),
          isActive: discount.isActive,
        }}
      />
    </div>
  );
}
