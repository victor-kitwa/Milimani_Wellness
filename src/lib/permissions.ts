/*
 * The store's staff access model, in one place so the schema, auth
 * helpers, server actions, nav filtering, and the team-member form all
 * agree on the same set of sections.
 *
 * Two roles above "customer":
 * - "admin"  — full access to everything, including managing the team
 *   itself. Not delegable: whether someone can manage other admins/staff
 *   is intentionally not a togglable permission, so a staff account can
 *   never grant itself (or anyone else) more access than it was given.
 * - "staff"  — access to exactly the sections an admin has switched on
 *   for them, via the `permissions` column on `users`.
 */

export const ADMIN_PERMISSIONS = [
  "manageProducts",
  "manageCategories",
  "manageOrders",
  "manageDiscounts",
  "viewReports",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export type AdminPermissions = Record<AdminPermission, boolean>;

export const NO_PERMISSIONS: AdminPermissions = {
  manageProducts: false,
  manageCategories: false,
  manageOrders: false,
  manageDiscounts: false,
  viewReports: false,
};

export const PERMISSION_LABELS: Record<AdminPermission, { label: string; description: string }> = {
  manageProducts: {
    label: "Products",
    description: "Add, edit, hide, and delete products",
  },
  manageCategories: {
    label: "Categories",
    description: "Add, edit, and delete categories",
  },
  manageOrders: {
    label: "Orders",
    description: "View orders and update their status or payment",
  },
  manageDiscounts: {
    label: "Discounts",
    description: "Create and manage discount codes",
  },
  viewReports: {
    label: "Reports",
    description: "View sales reports and top products",
  },
};

export type StoreRole = "customer" | "staff" | "admin";

type PermissionCheckable = {
  role: StoreRole;
  permissions?: AdminPermissions | null;
};

/** True for a full admin, or a staff account with that specific section switched on. */
export function hasPermission(user: PermissionCheckable, perm: AdminPermission): boolean {
  if (user.role === "admin") return true;
  if (user.role !== "staff") return false;
  return Boolean(user.permissions?.[perm]);
}

/** True if this account can access the admin dashboard at all. */
export function isStoreStaff(user: { role: StoreRole }): boolean {
  return user.role === "admin" || user.role === "staff";
}

/** True if a staff account has at least one section switched on. */
export function hasAnyPermission(user: PermissionCheckable): boolean {
  if (user.role === "admin") return true;
  if (user.role !== "staff") return false;
  return ADMIN_PERMISSIONS.some((perm) => Boolean(user.permissions?.[perm]));
}
