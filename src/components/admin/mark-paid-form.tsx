"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useSaveToast } from "@/components/admin/use-save-toast";
import { markOrderPaidManually, type ActionState } from "@/server/admin-order-actions";

export function MarkPaidForm({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(markOrderPaidManually, {});
  useSaveToast(state, "Order marked as paid");

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={orderId} />
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "Saving..." : "Mark as paid manually"}
      </Button>
    </form>
  );
}
