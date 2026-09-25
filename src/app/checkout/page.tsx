import { redirect } from "next/navigation";
import { getCartWithItems } from "@/lib/cart";
import { getSession, getCurrentUser } from "@/lib/auth";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const { items, subtotal } = await getCartWithItems();
  if (items.length === 0) redirect("/cart");

  const session = await getSession();
  const user = session ? await getCurrentUser() : null;

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-xl font-bold text-foreground">Checkout</h1>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckoutForm
            subtotal={subtotal}
            defaultName={user?.name}
            defaultEmail={user?.email}
            defaultPhone={user?.phone ?? undefined}
          />
        </div>
        <div className="h-fit space-y-3 rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground">Order summary</p>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
              <span>
                {item.productName}
                {item.variantName ? ` (${item.variantName})` : ""} × {item.quantity}
              </span>
              <span>{formatCurrency(item.lineTotal)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Shipping (KSh 300, free above KSh 10,000) and any discount are calculated after you place the order.
          </p>
        </div>
      </div>
    </div>
  );
}
