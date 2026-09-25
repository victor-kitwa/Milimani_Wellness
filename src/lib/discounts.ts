import { db } from "@/db";
import { discountCodes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function validateDiscountCode(code: string, subtotal: number) {
  const [discount] = await db
    .select()
    .from(discountCodes)
    .where(eq(discountCodes.code, code.trim().toUpperCase()))
    .limit(1);

  if (!discount || !discount.isActive) {
    return { valid: false as const, error: "That discount code isn't valid" };
  }
  const now = new Date();
  if (discount.startsAt && new Date(discount.startsAt) > now) {
    return { valid: false as const, error: "This code isn't active yet" };
  }
  if (discount.expiresAt && new Date(discount.expiresAt) < now) {
    return { valid: false as const, error: "This code has expired" };
  }
  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    return { valid: false as const, error: "This code has reached its usage limit" };
  }
  if (discount.minOrderAmount && subtotal < Number(discount.minOrderAmount)) {
    return {
      valid: false as const,
      error: `Minimum order for this code is KSh ${Number(discount.minOrderAmount).toLocaleString()}`,
    };
  }

  const amount =
    discount.type === "percentage"
      ? Math.round((subtotal * Number(discount.value)) / 100)
      : Math.min(Number(discount.value), subtotal);

  return { valid: true as const, discount, discountAmount: amount };
}
