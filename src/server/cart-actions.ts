"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cartItems, products, productVariants } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getOrCreateCart, findExistingCartItem } from "@/lib/cart";
import { addToCartSchema } from "@/lib/validation";
import { redirect } from "next/navigation";

function availableStock(row: { trackInventory: boolean; stockQuantity: number }) {
  return row.trackInventory ? row.stockQuantity : Number.POSITIVE_INFINITY;
}

export async function addToCartAction(formData: FormData) {
  const parsed = addToCartSchema.safeParse({
    productId: formData.get("productId"),
    variantId: formData.get("variantId") || null,
    quantity: formData.get("quantity") || 1,
  });
  if (!parsed.success) return;
  const { productId, variantId, quantity } = parsed.data;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product || !product.isActive) return;

  let stock = availableStock(product);
  if (variantId) {
    const [variant] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);
    if (!variant) return;
    stock = product.trackInventory ? variant.stockQuantity : Number.POSITIVE_INFINITY;
  }

  const cart = await getOrCreateCart();
  const existing = await findExistingCartItem(cart.id, productId, variantId ?? null);

  if (existing) {
    const newQty = Math.min(existing.quantity + quantity, Math.max(stock, 0));
    await db.update(cartItems).set({ quantity: newQty }).where(eq(cartItems.id, existing.id));
  } else {
    const qty = Math.min(quantity, Math.max(stock, 0));
    if (qty <= 0) return;
    await db.insert(cartItems).values({
      cartId: cart.id,
      productId,
      variantId: variantId ?? null,
      quantity: qty,
    });
  }

  revalidatePath("/", "layout");
  redirect("/cart");
}

export async function updateCartItemAction(formData: FormData) {
  const itemId = String(formData.get("itemId") || "");
  const quantity = Number(formData.get("quantity") || 0);
  if (!itemId) return;

  // Scoped to the caller's own cart (getOrCreateCart resolves it from
  // their session or guest cookie) - without this, itemId is just a
  // hidden form field anyone could edit to quantity/delete another
  // visitor's cart item.
  const cart = await getOrCreateCart();
  const ownedItem = and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id));

  if (quantity <= 0) {
    await db.delete(cartItems).where(ownedItem);
  } else {
    const [item] = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        variantId: cartItems.variantId,
      })
      .from(cartItems)
      .where(ownedItem)
      .limit(1);
    if (!item) return;

    let stock = Number.POSITIVE_INFINITY;
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1);
    if (product) stock = availableStock(product);
    if (item.variantId) {
      const [variant] = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.id, item.variantId))
        .limit(1);
      if (variant && product?.trackInventory) stock = variant.stockQuantity;
    }

    await db
      .update(cartItems)
      .set({ quantity: Math.min(quantity, Math.max(stock, 1)) })
      .where(ownedItem);
  }

  revalidatePath("/", "layout");
}

export async function removeCartItemAction(formData: FormData) {
  const itemId = String(formData.get("itemId") || "");
  if (!itemId) return;
  const cart = await getOrCreateCart();
  await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
  revalidatePath("/", "layout");
}
