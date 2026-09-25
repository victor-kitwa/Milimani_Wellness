import { cookies } from "next/headers";
import { db } from "@/db";
import { carts, cartItems, products, productVariants } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";

const CART_COOKIE = "duka_cart";

// The cart cookie itself is created in proxy.ts (Next.js only allows
// setting cookies from a Proxy/Route Handler/Server Action, never while a
// Server Component renders). This just reads it, with a same-request
// fallback in the unlikely case a request reached here without going
// through the proxy.
async function getOrCreateSessionToken() {
  const store = await cookies();
  const token = store.get(CART_COOKIE)?.value;
  return token ?? randomUUID();
}

/** Finds or creates the cart for the current visitor (logged in or guest). */
export async function getOrCreateCart() {
  const session = await getSession();

  if (session) {
    const [existing] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, session.userId))
      .limit(1);
    if (existing) return existing;
    const [created] = await db
      .insert(carts)
      .values({ userId: session.userId })
      .returning();
    return created;
  }

  const token = await getOrCreateSessionToken();
  const [existing] = await db
    .select()
    .from(carts)
    .where(eq(carts.sessionToken, token))
    .limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(carts)
    .values({ sessionToken: token })
    .returning();
  return created;
}

export async function getCartWithItems() {
  const cart = await getOrCreateCart();
  const items = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      productImages: products.images,
      productPrice: products.price,
      productStock: products.stockQuantity,
      trackInventory: products.trackInventory,
      variantId: productVariants.id,
      variantName: productVariants.name,
      variantPrice: productVariants.price,
      variantStock: productVariants.stockQuantity,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .leftJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .where(eq(cartItems.cartId, cart.id));

  const line = items.map((i) => {
    const unitPrice = i.variantId
      ? Number(i.variantPrice ?? i.productPrice)
      : Number(i.productPrice);
    const stock = i.variantId ? i.variantStock : i.productStock;
    return {
      ...i,
      unitPrice,
      lineTotal: unitPrice * i.quantity,
      availableStock: stock,
    };
  });

  const subtotal = line.reduce((sum, i) => sum + i.lineTotal, 0);
  const itemCount = line.reduce((sum, i) => sum + i.quantity, 0);

  return { cart, items: line, subtotal, itemCount };
}

export async function clearCart(cartId: string) {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}

export async function findExistingCartItem(
  cartId: string,
  productId: string,
  variantId: string | null
) {
  const [existing] = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, cartId),
        eq(cartItems.productId, productId),
        variantId ? eq(cartItems.variantId, variantId) : isNull(cartItems.variantId)
      )
    )
    .limit(1);
  return existing ?? null;
}
