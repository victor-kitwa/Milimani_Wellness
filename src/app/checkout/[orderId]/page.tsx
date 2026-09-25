import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderForConfirmation } from "@/server/order-status-actions";
import { PaymentStatusPoller } from "@/components/storefront/payment-status";
import { formatCurrency } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

export const metadata = { title: "Order confirmation" };

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const data = await getOrderForConfirmation(orderId);
  if (!data) notFound();
  const { order, items } = data;

  return (
    <div className="container-page max-w-2xl py-10">
      <p className="text-sm font-medium text-brand">Order {order.orderNumber}</p>
      <h1 className="mt-1 text-2xl font-bold text-foreground">Thanks, {order.customerName.split(" ")[0]}!</h1>

      {order.paymentMethod === "mpesa" && (
        <div className="mt-6">
          <PaymentStatusPoller orderId={order.id} initialStatus={order.paymentStatus} />
        </div>
      )}
      {order.paymentMethod === "cash_on_delivery" && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm text-foreground">
          Your order is confirmed. Pay in cash when it's delivered.
        </div>
      )}

      <div className="mt-8 rounded-xl border border-border bg-card p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Order details</p>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
              <span>
                {item.productName}
                {item.variantLabel ? ` (${item.variantLabel})` : ""} × {item.quantity}
              </span>
              <span>{formatCurrency(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Discount ({order.discountCode})</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>{Number(order.shippingFee) === 0 ? "Free" : formatCurrency(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground">
        Delivering to {order.shippingAddress.streetAddress}, {order.shippingAddress.town},{" "}
        {order.shippingAddress.county}
      </div>

      <ButtonLink href="/" variant="outline" className="mt-8">
        Continue shopping
      </ButtonLink>
      <p className="mt-4 text-center text-xs text-muted">
        <Link href="/" className="hover:text-brand">Bookmark this page</Link> to check your order status later.
      </p>
    </div>
  );
}
