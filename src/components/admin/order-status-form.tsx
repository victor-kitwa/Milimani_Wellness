"use client";

import { useActionState } from "react";
import { Select } from "@/components/admin/admin-input";
import { Button } from "@/components/ui/button";
import { useSaveToast } from "@/components/admin/use-save-toast";
import { updateOrderStatus, type ActionState } from "@/server/admin-order-actions";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

export function OrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateOrderStatus, {});
  useSaveToast(state, "Order status updated");

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={orderId} />
      <Select name="status" defaultValue={currentStatus} className="w-40">
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Updating..." : "Update status"}
      </Button>
    </form>
  );
}
