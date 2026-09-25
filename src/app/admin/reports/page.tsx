import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { Card } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { SalesChart } from "@/components/admin/sales-chart";
import { requireAdminPagePermission } from "@/lib/auth";

export const metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  await requireAdminPagePermission("viewReports");
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const salesByDayRaw = await db
    .select({
      day: sql<string>`to_char(${orders.createdAt}, 'Mon DD')`,
      dayKey: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      total: sql<string>`sum(${orders.total})`,
    })
    .from(orders)
    .where(and(eq(orders.paymentStatus, "paid"), gte(orders.createdAt, since)))
    .groupBy(sql`1, 2`)
    .orderBy(sql`2`);

  // Fill in missing days with zero so the chart doesn't look sparse/misleading.
  const byKey = new Map(salesByDayRaw.map((r) => [r.dayKey, Number(r.total)]));
  const chartData: { day: string; total: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-KE", { month: "short", day: "2-digit" });
    chartData.push({ day: label, total: byKey.get(key) ?? 0 });
  }

  const topProducts = await db
    .select({
      productName: orderItems.productName,
      unitsSold: sql<number>`sum(${orderItems.quantity})::int`,
      revenue: sql<string>`sum(${orderItems.lineTotal})`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(eq(orders.paymentStatus, "paid"))
    .groupBy(orderItems.productName)
    .orderBy(sql`sum(${orderItems.lineTotal}) desc`)
    .limit(8);

  const totalRevenue = chartData.reduce((sum, d) => sum + d.total, 0);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-foreground">Reports</h1>

      <Card className="p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-sm font-semibold text-foreground">Sales, last 14 days</p>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{formatCurrency(totalRevenue)}</span>
          </p>
        </div>
        <SalesChart data={chartData} />
      </Card>

      <Card className="mt-6 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Top products (all time, paid orders)</p>
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No paid orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Product</th>
                <th className="py-2">Units sold</th>
                <th className="py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topProducts.map((p) => (
                <tr key={p.productName}>
                  <td className="py-2 text-foreground">{p.productName}</td>
                  <td className="py-2 text-muted-foreground">{p.unitsSold}</td>
                  <td className="py-2 text-right font-medium text-foreground">{formatCurrency(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
