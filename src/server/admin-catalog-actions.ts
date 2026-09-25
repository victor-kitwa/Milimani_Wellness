"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories, products, productVariants } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { categorySchema, productSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export type ActionState = { error?: string; success?: boolean };

async function uniqueSlug(base: string, table: "category" | "product", ignoreId?: string) {
  let slug = slugify(base) || "item";
  let attempt = slug;
  let n = 1;
  while (true) {
    const rows =
      table === "category"
        ? await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, attempt))
        : await db.select({ id: products.id }).from(products).where(eq(products.slug, attempt));
    const clash = rows.find((r) => r.id !== ignoreId);
    if (!clash) return attempt;
    n += 1;
    attempt = `${slug}-${n}`;
  }
}

// ---------- Categories ----------
export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("manageCategories");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    parentId: formData.get("parentId") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const slug = await uniqueSlug(parsed.data.name, "category");
  await db.insert(categories).values({
    name: parsed.data.name,
    slug,
    description: parsed.data.description || null,
    imageUrl: parsed.data.imageUrl || null,
    parentId: parsed.data.parentId || null,
  });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateCategory(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission("manageCategories");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    parentId: formData.get("parentId") || null,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await db
    .update(categories)
    .set({
      name: parsed.data.name,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
      parentId: parsed.data.parentId || null,
      isActive: parsed.data.isActive ?? true,
    })
    .where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteCategory(formData: FormData) {
  await requirePermission("manageCategories");
  const id = String(formData.get("id"));
  await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

// ---------- Products ----------
function readVariantsFromFormData(formData: FormData) {
  const raw = formData.get("variants");
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("manageProducts");
  const images = formData.getAll("images").filter((v): v is string => typeof v === "string" && v.length > 0);

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId") || null,
    sku: formData.get("sku"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || null,
    costPrice: formData.get("costPrice") || null,
    trackInventory: formData.get("trackInventory") === "on",
    stockQuantity: formData.get("stockQuantity") || 0,
    lowStockThreshold: formData.get("lowStockThreshold") || 5,
    images,
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    variants: readVariantsFromFormData(formData),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  const slug = await uniqueSlug(data.name, "product");
  const [product] = await db
    .insert(products)
    .values({
      name: data.name,
      slug,
      description: data.description || null,
      categoryId: data.categoryId || null,
      sku: data.sku || null,
      price: data.price.toFixed(2),
      compareAtPrice: data.compareAtPrice != null ? data.compareAtPrice.toFixed(2) : null,
      costPrice: data.costPrice != null ? data.costPrice.toFixed(2) : null,
      trackInventory: data.trackInventory,
      stockQuantity: data.stockQuantity,
      lowStockThreshold: data.lowStockThreshold,
      images: data.images,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
    })
    .returning();

  if (data.variants.length > 0) {
    await db.insert(productVariants).values(
      data.variants.map((v) => ({
        productId: product.id,
        name: v.name,
        options: v.options ?? {},
        sku: v.sku || null,
        price: v.price != null ? v.price.toFixed(2) : null,
        stockQuantity: v.stockQuantity,
        imageUrl: v.imageUrl || null,
      }))
    );
  }

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission("manageProducts");
  const images = formData.getAll("images").filter((v): v is string => typeof v === "string" && v.length > 0);

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId") || null,
    sku: formData.get("sku"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || null,
    costPrice: formData.get("costPrice") || null,
    trackInventory: formData.get("trackInventory") === "on",
    stockQuantity: formData.get("stockQuantity") || 0,
    lowStockThreshold: formData.get("lowStockThreshold") || 5,
    images,
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    variants: readVariantsFromFormData(formData),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  await db
    .update(products)
    .set({
      name: data.name,
      description: data.description || null,
      categoryId: data.categoryId || null,
      sku: data.sku || null,
      price: data.price.toFixed(2),
      compareAtPrice: data.compareAtPrice != null ? data.compareAtPrice.toFixed(2) : null,
      costPrice: data.costPrice != null ? data.costPrice.toFixed(2) : null,
      trackInventory: data.trackInventory,
      stockQuantity: data.stockQuantity,
      lowStockThreshold: data.lowStockThreshold,
      images: data.images,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));

  // Reconcile variants: update existing, insert new, delete removed.
  const existing = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(eq(productVariants.productId, id));
  const existingIds = new Set(existing.map((v) => v.id));
  const keepIds = new Set(data.variants.filter((v) => v.id).map((v) => v.id!));
  const toDelete = [...existingIds].filter((vid) => !keepIds.has(vid));

  if (toDelete.length > 0) {
    await db.delete(productVariants).where(inArray(productVariants.id, toDelete));
  }
  for (const v of data.variants) {
    if (v.id && existingIds.has(v.id)) {
      await db
        .update(productVariants)
        .set({
          name: v.name,
          options: v.options ?? {},
          sku: v.sku || null,
          price: v.price != null ? v.price.toFixed(2) : null,
          stockQuantity: v.stockQuantity,
          imageUrl: v.imageUrl || null,
        })
        .where(eq(productVariants.id, v.id));
    } else {
      await db.insert(productVariants).values({
        productId: id,
        name: v.name,
        options: v.options ?? {},
        sku: v.sku || null,
        price: v.price != null ? v.price.toFixed(2) : null,
        stockQuantity: v.stockQuantity,
        imageUrl: v.imageUrl || null,
      });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteProduct(formData: FormData) {
  await requirePermission("manageProducts");
  const id = String(formData.get("id"));
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

export async function toggleProductActive(formData: FormData) {
  await requirePermission("manageProducts");
  const id = String(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  await db.update(products).set({ isActive: !isActive }).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}
