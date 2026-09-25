"use client";

import { useMemo, useState } from "react";
import { addToCartAction } from "@/server/cart-actions";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

export type VariantData = {
  id: string;
  name: string;
  options: Record<string, string>;
  price: string | null;
  stockQuantity: number;
};

export function ProductPurchasePanel({
  productId,
  basePrice,
  trackInventory,
  productStock,
  variants,
}: {
  productId: string;
  basePrice: string;
  trackInventory: boolean;
  productStock: number;
  variants: VariantData[];
}) {
  const optionGroups = useMemo(() => {
    const groups = new Map<string, Set<string>>();
    for (const v of variants) {
      for (const [key, value] of Object.entries(v.options)) {
        if (!groups.has(key)) groups.set(key, new Set());
        groups.get(key)!.add(value);
      }
    }
    return [...groups.entries()].map(([key, values]) => ({ key, values: [...values] }));
  }, [variants]);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const group of optionGroups) initial[group.key] = group.values[0];
    return initial;
  });
  const [quantity, setQuantity] = useState(1);

  const matchedVariant =
    variants.length > 0
      ? variants.find((v) =>
          optionGroups.every((g) => v.options[g.key] === selected[g.key])
        )
      : null;

  const price = matchedVariant?.price ?? basePrice;
  const stock = variants.length > 0 ? matchedVariant?.stockQuantity ?? 0 : productStock;
  const outOfStock = trackInventory && stock <= 0;
  const maxQty = trackInventory ? Math.max(stock, 0) : 99;

  return (
    <div className="space-y-5">
      <p className="text-2xl font-bold text-foreground">{formatCurrency(price)}</p>

      {optionGroups.map((group) => (
        <div key={group.key}>
          <p className="mb-1.5 text-sm font-medium text-foreground">{group.key}</p>
          <div className="flex flex-wrap gap-2">
            {group.values.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelected((s) => ({ ...s, [group.key]: value }))}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  selected[group.key] === value
                    ? "border-brand bg-brand/10 text-brand-dark"
                    : "border-border text-muted-foreground hover:border-border-strong"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}

      {trackInventory && (
        <p className={`text-sm ${outOfStock ? "text-danger" : "text-muted-foreground"}`}>
          {outOfStock ? "Out of stock" : `${stock} in stock`}
        </p>
      )}

      <form action={addToCartAction} className="flex items-center gap-3">
        <input type="hidden" name="productId" value={productId} />
        {matchedVariant && <input type="hidden" name="variantId" value={matchedVariant.id} />}
        <input type="hidden" name="quantity" value={quantity} />

        <div className="flex items-center rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:bg-surface"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:bg-surface"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <Button type="submit" size="lg" disabled={outOfStock || (variants.length > 0 && !matchedVariant)} className="flex-1">
          {outOfStock ? "Out of stock" : "Add to cart"}
        </Button>
      </form>
    </div>
  );
}
