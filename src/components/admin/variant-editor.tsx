"use client";

import { useState } from "react";
import { Input } from "@/components/admin/admin-input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export type VariantRow = {
  id?: string;
  name: string;
  optionsText: string; // "Size:L, Color:Red"
  sku: string;
  price: string;
  stockQuantity: string;
  imageUrl: string;
};

function parseOptions(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of text.split(",")) {
    const [k, v] = part.split(":").map((s) => s.trim());
    if (k && v) out[k] = v;
  }
  return out;
}

export function VariantEditor({
  fieldName,
  initial = [],
}: {
  fieldName: string;
  initial?: VariantRow[];
}) {
  const [rows, setRows] = useState<VariantRow[]>(initial);

  const serialized = JSON.stringify(
    rows
      .filter((r) => r.name.trim())
      .map((r) => ({
        id: r.id,
        name: r.name,
        options: parseOptions(r.optionsText),
        sku: r.sku,
        price: r.price ? Number(r.price) : null,
        stockQuantity: r.stockQuantity ? Number(r.stockQuantity) : 0,
        imageUrl: r.imageUrl,
      }))
  );

  function update(i: number, patch: Partial<VariantRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <div>
      <input type="hidden" name={fieldName} value={serialized} />
      <p className="mb-2 text-xs text-muted-foreground">
        Use variants for options like Size or Color. Leave empty for a simple product with one
        price and stock count. Options format: <code>Size:L, Color:Red</code>
      </p>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 sm:grid-cols-6">
            <Input
              placeholder="Variant name (Red / L)"
              value={row.name}
              onChange={(e) => update(i, { name: e.target.value })}
              className="sm:col-span-2"
            />
            <Input
              placeholder="Options: Size:L, Color:Red"
              value={row.optionsText}
              onChange={(e) => update(i, { optionsText: e.target.value })}
              className="sm:col-span-2"
            />
            <Input
              placeholder="SKU"
              value={row.sku}
              onChange={(e) => update(i, { sku: e.target.value })}
            />
            <Input
              placeholder="Price override"
              type="number"
              value={row.price}
              onChange={(e) => update(i, { price: e.target.value })}
            />
            <Input
              placeholder="Stock"
              type="number"
              value={row.stockQuantity}
              onChange={(e) => update(i, { stockQuantity: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
              className="flex items-center justify-center gap-1 rounded-lg text-sm text-danger hover:bg-danger-soft"
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() =>
          setRows((prev) => [
            ...prev,
            { name: "", optionsText: "", sku: "", price: "", stockQuantity: "0", imageUrl: "" },
          ])
        }
      >
        <Plus className="h-4 w-4" /> Add variant
      </Button>
    </div>
  );
}
