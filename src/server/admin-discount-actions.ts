"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { discountCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { discountCodeSchema } from "@/lib/validation";

export type ActionState = { error?: string; success?: boolean };

export async function createDiscount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("manageDiscounts");
  const parsed = discountCodeSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    minOrderAmount: formData.get("minOrderAmount") || null,
    usageLimit: formData.get("usageLimit") || null,
    startsAt: formData.get("startsAt") || null,
    expiresAt: formData.get("expiresAt") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  const [existing] = await db
    .select({ id: discountCodes.id })
    .from(discountCodes)
    .where(eq(discountCodes.code, data.code.toUpperCase()));
  if (existing) return { error: "That code already exists" };

  await db.insert(discountCodes).values({
    code: data.code.toUpperCase(),
    type: data.type,
    value: data.value.toFixed(2),
    minOrderAmount: data.minOrderAmount != null ? data.minOrderAmount.toFixed(2) : null,
    usageLimit: data.usageLimit ?? null,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
  });
  revalidatePath("/admin/discounts");
  return { success: true };
}

export async function updateDiscount(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission("manageDiscounts");
  const parsed = discountCodeSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    minOrderAmount: formData.get("minOrderAmount") || null,
    usageLimit: formData.get("usageLimit") || null,
    startsAt: formData.get("startsAt") || null,
    expiresAt: formData.get("expiresAt") || null,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  const [existing] = await db
    .select({ id: discountCodes.id })
    .from(discountCodes)
    .where(eq(discountCodes.code, data.code.toUpperCase()));
  if (existing && existing.id !== id) return { error: "That code already exists" };

  await db
    .update(discountCodes)
    .set({
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value.toFixed(2),
      minOrderAmount: data.minOrderAmount != null ? data.minOrderAmount.toFixed(2) : null,
      usageLimit: data.usageLimit ?? null,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive ?? true,
    })
    .where(eq(discountCodes.id, id));
  revalidatePath("/admin/discounts");
  revalidatePath(`/admin/discounts/${id}`);
  return { success: true };
}

export async function toggleDiscountActive(formData: FormData) {
  await requirePermission("manageDiscounts");
  const id = String(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  await db.update(discountCodes).set({ isActive: !isActive }).where(eq(discountCodes.id, id));
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(formData: FormData) {
  await requirePermission("manageDiscounts");
  const id = String(formData.get("id"));
  await db.delete(discountCodes).where(eq(discountCodes.id, id));
  revalidatePath("/admin/discounts");
}
