import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short").max(255),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(9).max(15).optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Password is optional here: creating a team member requires one (checked
// after parsing, so the "required" message can be specific), editing one
// leaves it blank to keep their current password.
export const teamMemberSchema = z.object({
  name: z.string().min(2, "Name is too short").max(255),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(9).max(15).optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["staff", "admin"]),
  manageProducts: z.boolean().optional().default(false),
  manageCategories: z.boolean().optional().default(false),
  manageOrders: z.boolean().optional().default(false),
  manageDiscounts: z.boolean().optional().default(false),
  viewReports: z.boolean().optional().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(150),
  slug: z.string().min(1).max(150).optional(),
  description: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  parentId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  options: z.record(z.string(), z.string()).optional().default({}),
  sku: z.string().optional().or(z.literal("")),
  price: z.coerce.number().nonnegative().optional().nullable(),
  stockQuantity: z.coerce.number().int().nonnegative().default(0),
  imageUrl: z.string().optional().or(z.literal("")),
});

export const productSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional().or(z.literal("")),
  categoryId: z.string().uuid().optional().nullable(),
  sku: z.string().optional().or(z.literal("")),
  price: z.coerce.number().nonnegative(),
  compareAtPrice: z.coerce.number().nonnegative().optional().nullable(),
  costPrice: z.coerce.number().nonnegative().optional().nullable(),
  trackInventory: z.boolean().optional().default(true),
  stockQuantity: z.coerce.number().int().nonnegative().optional().default(0),
  lowStockThreshold: z.coerce.number().int().nonnegative().optional().default(5),
  images: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  seoTitle: z.string().optional().or(z.literal("")),
  seoDescription: z.string().optional().or(z.literal("")),
  variants: z.array(productVariantSchema).optional().default([]),
});

export const discountCodeSchema = z.object({
  code: z.string().min(2).max(50),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().nonnegative().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.coerce.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2).max(255),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().min(9).max(15),
  county: z.string().min(1),
  town: z.string().min(1),
  streetAddress: z.string().min(1),
  notes: z.string().optional().or(z.literal("")),
  discountCode: z.string().optional().or(z.literal("")),
  paymentMethod: z.enum(["mpesa", "cash_on_delivery"]),
  saveAddress: z.boolean().optional().default(false),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
