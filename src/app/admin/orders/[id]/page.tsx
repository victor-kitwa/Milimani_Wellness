import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders, orderItems, payments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge, Card } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { MarkPaidForm } from "@/components/admin/mark-paid-form";
import { requireAdminPagePermission } from "@/lib/auth";

export const metadata = { title: "Order detail" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPagePermission("manageOrders");
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) notFound();

  const [items, paymentRows] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db.select().from(payments).where(eq(payments.orderId, id)).orderBy(desc(payments.createdAt)),
  ]);

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString("en-KE")}
          </p>
        </div>
        <Badge tone={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "failed" ? "danger" : "neutral"}>
          {order.paymentStatus}
        </Badge>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="p-5">
          <p className="mb-2 text-sm font-semibold text-foreground">Customer</p>
          <p className="text-sm text-foreground">{order.customerName}</p>
          <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
          {order.customerEmail && <p className="text-sm text-muted-foreground">{order.customerEmail}</p>}
        </Card>
        <Card className="p-5">
          <p className="mb-2 text-sm font-semibold text-foreground">Delivery address</p>
          <p className="text-sm text-foreground">{order.shippingAddress.streetAddress}</p>
          <p className="text-sm text-muted-foreground">
            {order.shippingAddress.town}, {order.shippingAddress.county}
          </p>
          {order.shippingAddress.notes && (
            <p className="mt-1 text-xs text-muted">Note: {order.shippingAddress.notes}</p>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Items</p>
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
            <span>{formatCurrency(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </Card>

      {paymentRows.length > 0 && (
        <Card className="mt-6 p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">Payment attempts</p>
          <div className="space-y-2">
            {paymentRows.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {p.provider} · {p.method ?? "—"} ·{" "}
                  {new Date(p.createdAt).toLocaleString("en-KE")}
                </span>
                <Badge tone={p.status === "completed" ? "success" : p.status === "failed" ? "danger" : "neutral"}>
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-6 flex flex-wrap items-center gap-4 p-5">
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />

        {order.paymentStatus !== "paid" && <MarkPaidForm orderId={order.id} />}
      </Card>
    </div>
  );
}
