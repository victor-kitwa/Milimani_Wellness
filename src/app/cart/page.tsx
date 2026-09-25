import Image from "next/image";
import Link from "next/link";
import { getCartWithItems } from "@/lib/cart";
import { updateCartItemAction, removeCartItemAction } from "@/server/cart-actions";
import { formatCurrency } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { X } from "lucide-react";

export const metadata = { title: "Your cart" };

export default async function CartPage() {
  const { items, subtotal } = await getCartWithItems();

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add something you like and it will show up here.</p>
        <ButtonLink href="/" className="mt-6 inline-flex">
          Continue shopping
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-xl font-bold text-foreground">Your cart</h1>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 divide-y divide-border rounded-xl border border-border bg-card">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface">
                {item.productImages?.[0] ? (
                  <Image src={item.productImages[0]} alt={item.productName} fill sizes="80px" className="object-cover" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Link href={`/products/${item.productSlug}`} className="font-medium text-foreground hover:text-brand">
                  {item.productName}
                </Link>
                {item.variantName && <p className="text-sm text-muted-foreground">{item.variantName}</p>}
                <p className="text-sm font-semibold text-foreground">{formatCurrency(item.unitPrice)}</p>

                <div className="mt-auto flex items-center gap-3">
                  <form action={updateCartItemAction} className="flex items-center gap-2">
                    <input type="hidden" name="itemId" value={item.id} />
                    <input
                      type="number"
                      name="quantity"
                      min={1}
                      max={item.availableStock ?? undefined}
                      defaultValue={item.quantity}
                      className="h-8 w-16 rounded-lg border border-border px-2 text-sm"
                    />
                    <button type="submit" className="text-xs font-medium text-brand hover:underline">
                      Update
                    </button>
                  </form>
                  <form action={removeCartItemAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <button
                      type="submit"
                      className="flex items-center gap-1 text-xs font-medium text-muted hover:text-danger"
                    >
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </form>
                </div>
              </div>
              <p className="whitespace-nowrap font-semibold text-foreground">
                {formatCurrency(item.lineTotal)}
              </p>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-border bg-card p-5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Shipping and discount codes are applied at checkout.</p>
          <ButtonLink href="/checkout" size="lg" className="mt-4 w-full">
            Proceed to checkout
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
