"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Tag,
  BarChart3,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Resolved by name on the client rather than taking a component reference
// as a prop - the admin layout that renders this is a Server Component,
// and a Lucide icon is a component object, not plain serializable data
// (same reasoning as src/lib/category-icon.ts and floating-wellness-decor.tsx).
const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  products: Package,
  categories: FolderTree,
  orders: ShoppingBag,
  discounts: Tag,
  reports: BarChart3,
  users: Users,
};

export type AdminNavIcon = keyof typeof ICONS;

export type AdminNavItem = {
  href: string;
  label: string;
  icon: AdminNavIcon;
};

export function AdminSidebarNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        // Exact match for the dashboard root so it doesn't stay lit up for
        // every nested /admin/* route.
        const isActive =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        return (
          <Link key={item.href} href={item.href}>
            <motion.div
              animate={{ x: isActive ? 6 : 0 }}
              whileHover={{ x: isActive ? 6 : 3 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors duration-200",
                isActive
                  ? "bg-brand/10 font-semibold text-brand"
                  : "text-muted-foreground hover:bg-surface hover:text-brand"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                  isActive ? "bg-brand text-brand-foreground" : "bg-surface text-muted-foreground"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
              </span>
              {item.label}
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
