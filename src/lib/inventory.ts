import { db } from "@/db";
import * as schema from "@/db/schema";
import { products, productVariants, inventoryLogs } from "@/db/schema";
import { eq, sql, type ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";

type AdjustLine = {
  productId: string;
  variantId?: string | null;
  quantity: number; // positive number of units involved
};

// Accepts either the top-level db handle or a transaction created via
// db.transaction(async (tx) => ...) - both support the same query builder
// methods we use here (update/insert).
type DbClient =
  | NodePgDatabase<typeof schema>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | PgTransaction<any, typeof schema, ExtractTablesWithRelations<typeof schema>>;

/**
 * Decrements stock for each line (a sale). Reason is always "sale".
 * Safe to call inside a transaction.
 */
export async function decrementStock(
  tx: DbClient,
  lines: AdjustLine[],
  referenceOrderId: string
) {
  for (const line of lines) {
    if (line.variantId) {
      await tx
        .update(productVariants)
        .set({ stockQuantity: sql`${productVariants.stockQuantity} - ${line.quantity}` })
        .where(eq(productVariants.id, line.variantId));
    } else {
      await tx
        .update(products)
        .set({ stockQuantity: sql`${products.stockQuantity} - ${line.quantity}` })
        .where(eq(products.id, line.productId));
    }
    await tx.insert(inventoryLogs).values({
      productId: line.productId,
      variantId: line.variantId ?? null,
      changeQty: -line.quantity,
      reason: "sale",
      referenceOrderId,
    });
  }
}

/** Restocks lines (e.g. a failed/cancelled payment after stock was reserved). */
export async function restockLines(
  lines: AdjustLine[],
  referenceOrderId: string,
  note?: string
) {
  for (const line of lines) {
    if (line.variantId) {
      await db
        .update(productVariants)
        .set({ stockQuantity: sql`${productVariants.stockQuantity} + ${line.quantity}` })
        .where(eq(productVariants.id, line.variantId));
    } else {
      await db
        .update(products)
        .set({ stockQuantity: sql`${products.stockQuantity} + ${line.quantity}` })
        .where(eq(products.id, line.productId));
    }
    await db.insert(inventoryLogs).values({
      productId: line.productId,
      variantId: line.variantId ?? null,
      changeQty: line.quantity,
      reason: "adjustment",
      referenceOrderId,
      note,
    });
  }
}
