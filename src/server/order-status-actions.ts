"use server";

import { db } from "@/db";
import { orders, payments, orderItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { checkPaymentStatus, IntasendError } from "@/lib/intasend";
import { reconcilePayment } from "@/lib/payment-reconcile";
import { getSession } from "@/lib/auth";

/**
 * Orders placed while signed in are only ever readable by that same
 * account - a guest who later finds/guesses the id can't pull someone
 * else's name, phone, and delivery address. Guest orders (userId is
 * null) have no account to check against, so they stay reachable by
 * anyone holding the order id itself: that id is a random UUID handed
 * out once, right after checkout, which is the deliberate "bookmark this
 * page to check your order later" flow guest checkout depends on.
 */
async function canViewOrder(order: { userId: string | null }) {
  if (!order.userId) return true;
  const session = await getSession();
  return session?.userId === order.userId;
}

/**
 * Reads the order's current payment state. If it's still pending and we
 * have an IntaSend invoice reference, actively pulls the latest status
 * from IntaSend (useful when the webhook isn't reachable yet, e.g. in
 * local development) and reconciles our records.
 */
export async function getOrderPaymentStatus(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return null;
  if (!(await canViewOrder(order))) return null;

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .orderBy(desc(payments.createdAt))
    .limit(1);

  if (
    payment &&
    payment.status === "pending" &&
    payment.provider === "intasend" &&
    payment.providerRef
  ) {
    try {
      const result = await checkPaymentStatus(payment.providerRef);
      const outcome = await reconcilePayment(orderId, payment.id, result.invoice.state, result);
      if (outcome.changed && outcome.status) {
        return {
          orderNumber: order.orderNumber,
          status: outcome.status === "paid" ? "processing" : order.status,
          paymentStatus: outcome.status,
          paymentMethod: order.paymentMethod,
          total: order.total,
        };
      }
    } catch (err) {
      // IntaSend not reachable / not configured yet - leave status as-is,
      // the customer can retry or the store can confirm manually.
      if (!(err instanceof IntasendError)) {
        console.error("Payment status check failed", err);
      }
    }
  }

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    total: order.total,
  };
}

export async function getOrderForConfirmation(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return null;
  if (!(await canViewOrder(order))) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  return { order, items };
}
