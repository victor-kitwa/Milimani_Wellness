import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/storefront/logout-button";

export const metadata = { title: "My account" };

const statusTone = {
  pending: "neutral",
  processing: "brand",
  shipped: "brand",
  delivered: "success",
  cancelled: "danger",
  refunded: "warning",
} as const;

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const myOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">My account</h1>
          <p className="text-sm text-muted-foreground">{user.name} · {user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-foreground">Order history</h2>
      {myOrders.length === 0 ? (
        <p className="text-muted-foreground">
          No orders yet. <Link href="/" className="text-brand hover:underline">Start shopping</Link>.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {myOrders.map((order) => (
            <Link
              key={order.id}
              href={`/checkout/${order.id}`}
              className="flex items-center justify-between p-4 hover:bg-surface"
            >
              <div>
                <p className="font-medium text-foreground">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={statusTone[order.status]}>{order.status}</Badge>
                <span className="font-semibold text-foreground">{formatCurrency(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
