import Link from "next/link";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Badge, Card } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { requireAdminPagePermission } from "@/lib/auth";
import { Pencil } from "lucide-react";

export const metadata = { title: "Orders" };

const STATUS_TONE = {
  pending: "neutral",
  processing: "brand",
  shipped: "brand",
  delivered: "success",
  cancelled: "danger",
  refunded: "warning",
} as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminPagePermission("manageOrders");
  const { status } = await searchParams;
  const filters = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
  const validStatus = filters.find((f) => f === status);

  const rows = validStatus
    ? await db.select().from(orders).where(eq(orders.status, validStatus)).orderBy(desc(orders.createdAt))
    : await db.select().from(orders).orderBy(desc(orders.createdAt));

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-foreground">Orders ({rows.length})</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1 text-xs font-medium ${!status ? "bg-foreground text-background" : "bg-surface text-muted-foreground"}`}
        >
          All
        </Link>
        {filters.map((f) => (
          <Link
            key={f}
            href={`/admin/orders?status=${f}`}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${status === f ? "bg-foreground text-background" : "bg-surface text-muted-foreground"}`}
          >
            {f}
          </Link>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border bg-surface text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-surface">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-foreground hover:text-brand">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{o.customerName}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(o.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={o.paymentStatus === "paid" ? "success" : o.paymentStatus === "failed" ? "danger" : "neutral"}>
                    {o.paymentStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">{formatCurrency(o.total)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    aria-label="Edit"
                    title="Edit"
                    className="inline-flex rounded-md p-1.5 text-brand transition-colors hover:bg-brand/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No orders found.</p>}
      </Card>
    </div>
  );
}
