"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  orders,
  orderItems,
  payments,
  products,
  productVariants,
  discountCodes,
  cartItems,
} from "@/db/schema";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { getCartWithItems } from "@/lib/cart";
import { getSession } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validation";
import { validateDiscountCode } from "@/lib/discounts";
import { decrementStock, restockLines } from "@/lib/inventory";
import { generateOrderNumber, normalizeKenyanPhone } from "@/lib/utils";
import { initiateMpesaStkPush, IntasendError } from "@/lib/intasend";

const SHIPPING_FEE = 300;
const FREE_SHIPPING_THRESHOLD = 10000;

export type CheckoutState = {
  error?: string;
};

export async function submitCheckoutAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone"),
    county: formData.get("county"),
    town: formData.get("town"),
    streetAddress: formData.get("streetAddress"),
    notes: formData.get("notes"),
    discountCode: formData.get("discountCode"),
    paymentMethod: formData.get("paymentMethod"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again" };
  }
  const data = parsed.data;

  const normalizedPhone = normalizeKenyanPhone(data.customerPhone);
  if (!normalizedPhone) {
    return { error: "Enter a valid Kenyan phone number, e.g. 0712 345 678" };
  }

  const { cart, items, subtotal } = await getCartWithItems();
  if (items.length === 0) {
    return { error: "Your cart is empty" };
  }

  for (const item of items) {
    if (item.availableStock !== null && item.quantity > (item.availableStock ?? 0)) {
      return { error: `${item.productName} only has ${item.availableStock} left in stock` };
    }
  }

  let discountAmount = 0;
  let discountCodeUsed: string | null = null;
  if (data.discountCode) {
    const result = await validateDiscountCode(data.discountCode, subtotal);
    if (!result.valid) return { error: result.error };
    discountAmount = result.discountAmount;
    discountCodeUsed = result.discount.code;
  }

  const shippingFee = subtotal - discountAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = Math.max(subtotal - discountAmount + shippingFee, 0);
  const session = await getSession();

  let order: typeof orders.$inferSelect;
  try {
    order = await db.transaction(async (tx) => {
    // Re-check stock under lock to avoid overselling on concurrent checkouts.
    for (const item of items) {
      if (item.variantId) {
        const [v] = await tx
          .select()
          .from(productVariants)
          .where(eq(productVariants.id, item.variantId))
          .for("update");
        if (!v || v.stockQuantity < item.quantity) {
          throw new Error(`${item.productName} is no longer available in that quantity`);
        }
      } else {
        const [p] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .for("update");
        if (
          !p ||
          (p.trackInventory && p.stockQuantity < item.quantity)
        ) {
          throw new Error(`${item.productName} is no longer available in that quantity`);
        }
      }
    }

    const [createdOrder] = await tx
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        userId: session?.userId ?? null,
        status: "pending",
        paymentStatus: "unpaid",
        paymentMethod: data.paymentMethod,
        customerName: data.customerName,
        customerEmail: data.customerEmail || null,
        customerPhone: normalizedPhone,
        shippingAddress: {
          county: data.county,
          town: data.town,
          streetAddress: data.streetAddress,
          notes: data.notes || undefined,
        },
        subtotal: subtotal.toFixed(2),
        discountCode: discountCodeUsed,
        discountAmount: discountAmount.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        total: total.toFixed(2),
        customerNote: data.notes || null,
      })
      .returning();

    await tx.insert(orderItems).values(
      items.map((item) => ({
        orderId: createdOrder.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantLabel: item.variantName ?? null,
        unitPrice: item.unitPrice.toFixed(2),
        quantity: item.quantity,
        lineTotal: item.lineTotal.toFixed(2),
      }))
    );

    await decrementStock(
      tx,
      items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      createdOrder.id
    );

    if (discountCodeUsed) {
      // validateDiscountCode already checked the usage limit above, but
      // that read happened before this transaction/lock, so two checkouts
      // racing for the last use of a limited code could both pass that
      // check and both land here. Re-checking the limit as part of this
      // same UPDATE (instead of trusting the earlier read) makes the
      // increment atomic: only an order that actually wins the last slot
      // gets committed, and everyone else's UPDATE matches zero rows.
      const [updatedDiscount] = await tx
        .update(discountCodes)
        .set({ usageCount: sql`${discountCodes.usageCount} + 1` })
        .where(
          and(
            eq(discountCodes.code, discountCodeUsed),
            or(isNull(discountCodes.usageLimit), lt(discountCodes.usageCount, discountCodes.usageLimit))
          )
        )
        .returning({ id: discountCodes.id });
      if (!updatedDiscount) {
        throw new Error(
          "That discount code just reached its usage limit - please remove it and try again"
        );
      }
    }

    await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    return createdOrder;
    });
  } catch (err) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "Something went wrong placing your order. Please try again." };
  }

  if (data.paymentMethod === "mpesa") {
    try {
      const result = await initiateMpesaStkPush({
        amount: total,
        phoneNumber: normalizedPhone,
        apiRef: order.id,
      });
      await db.insert(payments).values({
        orderId: order.id,
        provider: "intasend",
        providerRef: result.invoice.invoice_id,
        method: "mpesa",
        amount: total.toFixed(2),
        status: "pending",
        rawPayload: result as unknown as Record<string, unknown>,
      });
    } catch (err) {
      const message =
        err instanceof IntasendError
          ? `IntaSend error: ${err.message}`
          : "Could not reach the payment provider";
      await db.insert(payments).values({
        orderId: order.id,
        provider: "intasend",
        method: "mpesa",
        amount: total.toFixed(2),
        status: "failed",
        rawPayload: { error: message },
      });
      // The STK push never reached the customer's phone, so this order
      // can't be paid for - mark it failed immediately (instead of leaving
      // it "unpaid" forever) and release the stock it reserved.
      await db.update(orders).set({ paymentStatus: "failed" }).where(eq(orders.id, order.id));
      await restockLines(
        items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        order.id,
        `Could not start M-Pesa payment: ${message}`
      );
    }
  } else {
    await db.insert(payments).values({
      orderId: order.id,
      provider: "cod",
      method: "cash_on_delivery",
      amount: total.toFixed(2),
      status: "pending",
    });
  }

  redirect(`/checkout/${order.id}`);
}
