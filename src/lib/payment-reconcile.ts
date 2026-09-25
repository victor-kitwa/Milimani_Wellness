import { db } from "@/db";
import { orders, payments, orderItems } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { restockLines } from "@/lib/inventory";
import type { IntasendInvoiceState } from "@/lib/intasend";
import { mapInvoiceStateToPaymentStatus } from "@/lib/intasend";

/**
 * Applies an IntaSend invoice state to our order/payment records.
 * Idempotent: calling this twice with the same "paid" or "failed" result
 * only restocks/finalizes once, so it's safe to call from both the
 * webhook and the client-side status poll.
 */
export async function reconcilePayment(
  orderId: string,
  paymentId: string,
  state: IntasendInvoiceState,
  rawPayload: unknown
) {
  const mapped = mapInvoiceStateToPaymentStatus(state);
  if (mapped === "unpaid") return { changed: false as const };

  if (mapped === "paid") {
    const updated = await db
      .update(orders)
      .set({ paymentStatus: "paid", status: "processing" })
      .where(eq(orders.id, orderId))
      .returning({ paymentStatus: orders.paymentStatus });
    // Only actually "changed" if it wasn't already paid (avoids re-firing side effects)
    await db
      .update(payments)
      .set({ status: "completed", rawPayload: rawPayload as Record<string, unknown> })
      .where(eq(payments.id, paymentId));
    return { changed: updated.length > 0, status: "paid" as const };
  }

  // mapped === "failed" - only transition (and restock) once
  const updated = await db
    .update(orders)
    .set({ paymentStatus: "failed" })
    .where(and(eq(orders.id, orderId), ne(orders.paymentStatus, "failed")))
    .returning({ id: orders.id });

  await db
    .update(payments)
    .set({ status: "failed", rawPayload: rawPayload as Record<string, unknown> })
    .where(eq(payments.id, paymentId));

  if (updated.length > 0) {
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
    await restockLines(
      items.map((i) => ({
        productId: i.productId!,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      orderId,
      "M-Pesa payment failed or was cancelled"
    );
  }

  return { changed: updated.length > 0, status: "failed" as const };
}
