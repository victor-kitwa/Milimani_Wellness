import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, hasAnyPermission, isStoreStaff, type AdminPermission } from "@/lib/permissions";
import { AdminSidebarNav, type AdminNavItem } from "@/components/admin/admin-sidebar-nav";
import { ExternalLink } from "lucide-react";

const NAV: (AdminNavItem & { perm: AdminPermission | null; adminOnly?: boolean })[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", perm: null },
  { href: "/admin/products", label: "Products", icon: "products", perm: "manageProducts" },
  { href: "/admin/categories", label: "Categories", icon: "categories", perm: "manageCategories" },
  { href: "/admin/orders", label: "Orders", icon: "orders", perm: "manageOrders" },
  { href: "/admin/discounts", label: "Discounts", icon: "discounts", perm: "manageDiscounts" },
  { href: "/admin/reports", label: "Reports", icon: "reports", perm: "viewReports" },
  { href: "/admin/users", label: "Team & access", icon: "users", perm: null, adminOnly: true },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isStoreStaff(user)) redirect("/");
  // A staff account with every section switched off has nothing to do here.
  if (user.role === "staff" && !hasAnyPermission(user)) redirect("/");

  const visibleNav = NAV.filter((item) => {
    if (item.adminOnly) return user.role === "admin";
    if (!item.perm) return true;
    return hasPermission(user, item.perm);
  });

  return (
    // min-h-[calc(100vh-4rem)] accounts for the sticky h-16 site header
    // above this layout (same offset used by the auth pages) - without it,
    // this row is only as tall as its content, so on a short page the
    // sidebar's border/background stop mid-screen instead of reaching the
    // bottom of the viewport. align-items defaults to stretch, so the
    // aside then matches whichever is taller: this minimum, or the page
    // content itself on a long page.
    <div className="flex w-full min-h-[calc(100vh-4rem)]">
      {/* sticky top-16 pins the sidebar just below the site header as the
          content column scrolls, instead of it scrolling away with the
          page. h-[calc(100vh-4rem)] + overflow-y-auto caps it to the
          visible viewport (scrolling its own nav list internally if it
          ever grows taller than that) rather than stretching to match a
          long page's full height, which would defeat the sticking. */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card p-4 sm:sticky sm:top-16 sm:block sm:h-[calc(100vh-4rem)] sm:overflow-y-auto">
        <p className="mb-1 px-2 text-sm font-bold text-foreground">Store admin</p>
        <p className="mb-6 px-2 text-xs text-muted-foreground">
          {user.name} · {user.role === "admin" ? "Admin" : "Staff"}
        </p>
        <AdminSidebarNav items={visibleNav} />
        <Link
          href="/"
          className="mt-6 flex items-center gap-2 px-2.5 text-xs text-muted hover:text-brand"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View store
        </Link>
      </aside>
      <div className="min-w-0 flex-1 p-6">{children}</div>
    </div>
  );
}
