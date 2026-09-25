import Link from "next/link";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueTrendChart, type RevenuePoint } from "@/components/admin/revenue-trend-chart";
import { OrderStatusChart, type StatusPoint } from "@/components/admin/order-status-chart";
import { Badge, Card } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, ShoppingBag, PackageX, Clock, Sparkles, ArrowRight } from "lucide-react";

export const metadata = { title: "Admin dashboard" };

// Fixed order + reserved colors for the status chart, mirroring the
// Badge tone mapping already used on the orders list (STATUS_TONE in
// src/app/admin/orders/page.tsx) so a status means the same color
// everywhere in the admin, not just on this one chart.
const STATUS_ORDER = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
const STATUS_LABEL: Record<(typeof STATUS_ORDER)[number], string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};
const STATUS_COLOR: Record<(typeof STATUS_ORDER)[number], string> = {
  pending: "var(--color-muted)",
  processing: "var(--color-brand)",
  shipped: "var(--color-brand)",
  delivered: "var(--color-success)",
  cancelled: "var(--color-danger)",
  refunded: "var(--color-warning)",
};

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  // The dashboard is reachable by any staff account (the sidebar link has
  // no `perm`, so a staff member with just e.g. manageDiscounts can still
  // open it), but its content is business data (revenue, order details,
  // stock levels) that belongs to the sections a specific permission
  // unlocks. Without this, that discounts-only staffer would see revenue
  // and recent-order detail they were never granted access to. Sections
  // below only query and render for the permissions the account actually
  // has - an admin (hasPermission always true) sees everything, same as
  // before.
  const canViewOrders = user ? hasPermission(user, "manageOrders") || hasPermission(user, "viewReports") : false;
  const canViewProducts = user ? hasPermission(user, "manageProducts") : false;

  const [revenueRow] = canViewOrders
    ? await db
        .select({ total: sql<string>`coalesce(sum(${orders.total}), 0)` })
        .from(orders)
        .where(and(eq(orders.paymentStatus, "paid"), gte(orders.createdAt, startOfMonth)))
    : [];

  const [pendingRow] = canViewOrders
    ? await db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(eq(orders.status, "pending"))
    : [];

  const [ordersThisMonthRow] = canViewOrders
    ? await db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(gte(orders.createdAt, startOfMonth))
    : [];

  const lowStockProducts = canViewProducts
    ? await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.trackInventory, true),
            eq(products.isActive, true),
            sql`${products.stockQuantity} <= ${products.lowStockThreshold}`
          )
        )
        .limit(6)
    : [];

  const recentOrders = canViewOrders
    ? await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6)
    : [];

  const [paidOrdersRecent, statusCountRows] = canViewOrders
    ? await Promise.all([
        db
          .select({ createdAt: orders.createdAt, total: orders.total })
          .from(orders)
          .where(and(eq(orders.paymentStatus, "paid"), gte(orders.createdAt, fourteenDaysAgo))),
        db
          .select({ status: orders.status, count: sql<number>`count(*)::int` })
          .from(orders)
          .where(gte(orders.createdAt, thirtyDaysAgo))
          .groupBy(orders.status),
      ])
    : [[], []];

  // Revenue trend: bucket paid orders by calendar day and fill in the days
  // with no sales as 0, so the chart is a continuous 14-day line rather
  // than one with gaps wherever nothing sold.
  const revenueByDay = new Map<string, number>();
  const trendDays: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    trendDays.push(d);
    revenueByDay.set(dayKey(d), 0);
  }
  for (const o of paidOrdersRecent) {
    const key = dayKey(new Date(o.createdAt));
    if (revenueByDay.has(key)) {
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + Number(o.total));
    }
  }
  const revenueTrend: RevenuePoint[] = trendDays.map((d) => ({
    label: d.toLocaleDateString("en-KE", { day: "numeric", month: "short" }),
    revenue: revenueByDay.get(dayKey(d)) ?? 0,
  }));

  const statusCounts = new Map(statusCountRows.map((r) => [r.status, r.count]));
  const orderStatusData: StatusPoint[] = STATUS_ORDER.map((status) => ({
    label: STATUS_LABEL[status],
    count: statusCounts.get(status) ?? 0,
    color: STATUS_COLOR[status],
  }));

  const firstName = user?.name.split(" ")[0] ?? "there";
  const canAddProducts = user ? hasPermission(user, "manageProducts") : false;
  const todayLabel = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const pendingCount = pendingRow?.count ?? 0;
  const lowStockCount = lowStockProducts.length;
  const summaryParts: string[] = [];
  if (canViewOrders) summaryParts.push(`${pendingCount} order${pendingCount === 1 ? "" : "s"} waiting on you`);
  if (canViewProducts) summaryParts.push(`${lowStockCount} item${lowStockCount === 1 ? "" : "s"} running low`);
  const summaryLine =
    summaryParts.length > 0
      ? summaryParts.length === 2 && pendingCount === 0
        ? `Everything's caught up. ${summaryParts[1]}.`
        : `${summaryParts.join(", and ")}.`
      : "Here's what's available to your account.";

  return (
    <div>
      {/* Welcome banner: a pill, a gradient-clipped heading, a one-line
          status summary built from the real numbers below (not stock
          copy), and soft ambient glow blobs - same pattern used across
          the storefront (see wellness-tips-section.tsx). */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-md sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-brand/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {todayLabel}
            </span>
            <h1 className="mt-4 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-2xl font-bold leading-tight text-transparent sm:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{summaryLine}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canAddProducts && (
              <ButtonLink href="/admin/products/new" variant="gradient">
                Add product
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            )}
            <ButtonLink href="/" variant="outline">
              View store
            </ButtonLink>
          </div>
        </div>
      </div>

      {(canViewOrders || canViewProducts) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {canViewOrders && (
            <>
              <StatCard label="Revenue this month" value={formatCurrency(revenueRow?.total ?? 0)} icon={DollarSign} tone="brand" />
              <StatCard label="Orders this month" value={String(ordersThisMonthRow?.count ?? 0)} icon={ShoppingBag} />
              <StatCard label="Pending orders" value={String(pendingRow?.count ?? 0)} icon={Clock} tone={pendingRow?.count ? "brand" : "neutral"} />
            </>
          )}
          {canViewProducts && (
            <StatCard label="Low stock items" value={String(lowStockProducts.length)} icon={PackageX} tone={lowStockProducts.length ? "danger" : "neutral"} />
          )}
        </div>
      )}

      {canViewOrders && (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Revenue trend</p>
              <span className="text-xs text-muted-foreground">Last 14 days</span>
            </div>
            <RevenueTrendChart data={revenueTrend} />
          </Card>

          <Card className="p-5">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Orders by status</p>
              <span className="text-xs text-muted-foreground">Last 30 days</span>
            </div>
            <OrderStatusChart data={orderStatusData} />
          </Card>
        </div>
      )}

      {(canViewOrders || canViewProducts) && (
        <div className={`mt-8 grid gap-6 ${canViewOrders && canViewProducts ? "lg:grid-cols-2" : ""}`}>
          {canViewOrders && (
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Recent orders</p>
                <Link href="/admin/orders" className="text-xs text-brand hover:underline">View all</Link>
              </div>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((o) => (
                    <Link
                      key={o.id}
                      href={`/admin/orders/${o.id}`}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-surface"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{o.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{o.customerName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={o.paymentStatus === "paid" ? "success" : "neutral"}>{o.paymentStatus}</Badge>
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(o.total)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}

          {canViewProducts && (
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Low stock</p>
                <Link href="/admin/products" className="text-xs text-brand hover:underline">Manage products</Link>
              </div>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Everything is well stocked.</p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/products/${p.id}`}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-surface"
                    >
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <Badge tone="danger">{p.stockQuantity} left</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
