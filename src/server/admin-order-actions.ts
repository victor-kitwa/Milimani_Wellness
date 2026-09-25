"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { restockLines } from "@/lib/inventory";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type ActionState = { error?: string; success?: boolean };

// Both take (prevState, formData) rather than the plain (formData) they
// used to, so the order detail page can drive them through useActionState
// and show a "Saved" toast on success, the same pattern as every other
// admin save form (see use-save-toast.ts).
export async function updateOrderStatus(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission("manageOrders");
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return { error: "Invalid status" };
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return { error: "Order not found" };

  await db
    .update(orders)
    .set({ status: status as (typeof ORDER_STATUSES)[number], updatedAt: new Date() })
    .where(eq(orders.id, id));

  // If an admin cancels an order that still holds reserved stock, release it.
  if (status === "cancelled" && order.status !== "cancelled") {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    await restockLines(
      items.map((i) => ({ productId: i.productId!, variantId: i.variantId, quantity: i.quantity })),
      id,
      "Order cancelled by admin"
    );
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return { success: true };
}

export async function markOrderPaidManually(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission("manageOrders");
  const id = String(formData.get("id"));
  await db
    .update(orders)
    .set({ paymentStatus: "paid", status: "processing", updatedAt: new Date() })
    .where(eq(orders.id, id));
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return { success: true };
}
