"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { teamMemberSchema } from "@/lib/validation";
import { NO_PERMISSIONS, type AdminPermissions } from "@/lib/permissions";

export type ActionState = { error?: string; success?: boolean };

function readTeamMemberForm(formData: FormData) {
  return teamMemberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
    manageProducts: formData.get("manageProducts") === "on",
    manageCategories: formData.get("manageCategories") === "on",
    manageOrders: formData.get("manageOrders") === "on",
    manageDiscounts: formData.get("manageDiscounts") === "on",
    viewReports: formData.get("viewReports") === "on",
  });
}

function permissionsFrom(data: {
  role: "staff" | "admin";
  manageProducts: boolean;
  manageCategories: boolean;
  manageOrders: boolean;
  manageDiscounts: boolean;
  viewReports: boolean;
}): AdminPermissions {
  // Admins get full access implicitly — no point persisting checkboxes
  // that would just be ignored (and could look misleading if the role is
  // later downgraded back to staff without anyone touching them).
  if (data.role === "admin") return NO_PERMISSIONS;
  return {
    manageProducts: data.manageProducts,
    manageCategories: data.manageCategories,
    manageOrders: data.manageOrders,
    manageDiscounts: data.manageDiscounts,
    viewReports: data.viewReports,
  };
}

export async function createTeamMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = readTeamMemberForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  if (!data.password) return { error: "Set a password for the new team member" };

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email.toLowerCase()))
    .limit(1);
  if (existing) return { error: "An account with this email already exists" };

  const passwordHash = await hashPassword(data.password);
  await db.insert(users).values({
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone || null,
    passwordHash,
    role: data.role,
    permissions: permissionsFrom(data),
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateTeamMember(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const currentUser = await requireAdmin();
  if (currentUser.id === id) {
    return { error: "You can't change your own role or permissions here. Ask another admin." };
  }

  const parsed = readTeamMemberForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  const [emailClash] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email.toLowerCase()))
    .limit(1);
  if (emailClash && emailClash.id !== id) {
    return { error: "Another account already uses this email" };
  }

  const update: Partial<typeof users.$inferInsert> = {
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone || null,
    role: data.role,
    permissions: permissionsFrom(data),
    updatedAt: new Date(),
  };
  if (data.password) {
    update.passwordHash = await hashPassword(data.password);
  }

  await db.update(users).set(update).where(eq(users.id, id));
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  return { success: true };
}

// Non-destructive: demotes back to a regular customer account rather than
// deleting it, so order history and addresses tied to this user stay
// intact. Also refuses to demote yourself, so an admin can't accidentally
// lock themselves out of their own dashboard.
export async function revokeTeamMemberAccess(formData: FormData) {
  const currentUser = await requireAdmin();
  const id = String(formData.get("id"));
  if (currentUser.id === id) return;

  await db
    .update(users)
    .set({ role: "customer", permissions: NO_PERMISSIONS, updatedAt: new Date() })
    .where(eq(users.id, id));
  revalidatePath("/admin/users");
}
