"use client";

import { useActionState } from "react";
import { Field, Input, Select } from "@/components/admin/admin-input";
import { Button } from "@/components/ui/button";
import { useSaveToast } from "@/components/admin/use-save-toast";
import type { ActionState } from "@/server/admin-discount-actions";

// Also used for editing (the "-create-" name is a holdover) - one form,
// same as ProductForm/TeamMemberForm, driven by an `action` + `initial`
// pair rather than duplicating the fields in a second component.
export type DiscountFormInitial = {
  code: string;
  type: "percentage" | "fixed";
  value: string;
  minOrderAmount: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

const empty: DiscountFormInitial = {
  code: "",
  type: "percentage",
  value: "",
  minOrderAmount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

export function DiscountForm({
  action,
  initial = empty,
  submitLabel = "Create code",
  isEdit = false,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: DiscountFormInitial;
  submitLabel?: string;
  isEdit?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  useSaveToast(state, "Discount saved");

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Code">
        <Input name="code" required placeholder="WELCOME10" className="uppercase" defaultValue={initial.code} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <Select name="type" defaultValue={initial.type}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed (KSh)</option>
          </Select>
        </Field>
        <Field label="Value">
          <Input name="value" type="number" step="0.01" min="0" required defaultValue={initial.value} />
        </Field>
      </div>
      <Field label="Minimum order (optional)">
        <Input name="minOrderAmount" type="number" step="0.01" min="0" defaultValue={initial.minOrderAmount} />
      </Field>
      <Field label="Usage limit (optional)">
        <Input name="usageLimit" type="number" min="1" defaultValue={initial.usageLimit} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Starts (optional)">
          <Input name="startsAt" type="date" defaultValue={initial.startsAt} />
        </Field>
        <Field label="Expires (optional)">
          <Input name="expiresAt" type="date" defaultValue={initial.expiresAt} />
        </Field>
      </div>
      {isEdit && (
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="isActive" defaultChecked={initial.isActive} />
          Active
        </label>
      )}
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
