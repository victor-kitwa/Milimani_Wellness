"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea, Label } from "@/components/admin/admin-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { ImageUploader } from "@/components/admin/image-uploader";
import { VariantEditor, type VariantRow } from "@/components/admin/variant-editor";
import { useSaveToast } from "@/components/admin/use-save-toast";
import type { ActionState } from "@/server/admin-catalog-actions";

export type ProductFormInitial = {
  name: string;
  description: string;
  categoryId: string | null;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  costPrice: string | null;
  trackInventory: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  variants: VariantRow[];
};

const empty: ProductFormInitial = {
  name: "",
  description: "",
  categoryId: null,
  sku: "",
  price: "",
  compareAtPrice: null,
  costPrice: null,
  trackInventory: true,
  stockQuantity: 0,
  lowStockThreshold: 5,
  images: [],
  isActive: true,
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
  variants: [],
};

export function ProductForm({
  action,
  initial = empty,
  categories,
  submitLabel = "Save product",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: ProductFormInitial;
  categories: { id: string; name: string }[];
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  useSaveToast(state, "Product saved");

  return (
    <form action={formAction} className="space-y-6">
      <Card className="space-y-4 p-5">
        <Field label="Product name">
          <Input name="name" required defaultValue={initial.name} />
        </Field>
        <Field label="Description">
          <Textarea name="description" rows={4} defaultValue={initial.description} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select name="categoryId" defaultValue={initial.categoryId ?? ""}>
              <option value="">Uncategorised</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="SKU (optional)">
            <Input name="sku" defaultValue={initial.sku} />
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <p className="text-sm font-semibold text-foreground">Pricing & inventory</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (KSh)">
            <Input name="price" type="number" step="0.01" min="0" required defaultValue={initial.price} />
          </Field>
          <Field label="Compare-at price (optional)">
            <Input name="compareAtPrice" type="number" step="0.01" min="0" defaultValue={initial.compareAtPrice ?? ""} />
          </Field>
          <Field label="Cost price (optional)">
            <Input name="costPrice" type="number" step="0.01" min="0" defaultValue={initial.costPrice ?? ""} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="trackInventory" defaultChecked={initial.trackInventory} />
          Track stock for this product
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Stock quantity" hint="Used when there are no variants below">
            <Input name="stockQuantity" type="number" min="0" defaultValue={initial.stockQuantity} />
          </Field>
          <Field label="Low stock alert threshold">
            <Input name="lowStockThreshold" type="number" min="0" defaultValue={initial.lowStockThreshold} />
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Images</p>
        <ImageUploader name="images" initialImages={initial.images} />
      </Card>

      <Card className="p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Variants (optional)</p>
        <VariantEditor fieldName="variants" initial={initial.variants} />
      </Card>

      <Card className="space-y-4 p-5">
        <p className="text-sm font-semibold text-foreground">Visibility & SEO</p>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="isActive" defaultChecked={initial.isActive} />
            Visible on store
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="isFeatured" defaultChecked={initial.isFeatured} />
            Featured on homepage
          </label>
        </div>
        <Field label="SEO title (optional)">
          <Input name="seoTitle" defaultValue={initial.seoTitle} />
        </Field>
        <Field label="SEO description (optional)">
          <Textarea name="seoDescription" rows={2} defaultValue={initial.seoDescription} />
        </Field>
      </Card>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
