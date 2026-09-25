"use client";

import { useActionState } from "react";
import { submitCheckoutAction, type CheckoutState } from "@/server/checkout-actions";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KENYA_COUNTIES } from "@/lib/kenya-counties";
import { formatCurrency } from "@/lib/utils";

const initialState: CheckoutState = {};

export function CheckoutForm({
  subtotal,
  defaultName,
  defaultEmail,
  defaultPhone,
}: {
  subtotal: number;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
}) {
  const [state, formAction, pending] = useActionState(submitCheckoutAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <Input name="customerName" required defaultValue={defaultName} />
        </Field>
        <Field label="Phone number">
          <Input name="customerPhone" required placeholder="0712 345 678" defaultValue={defaultPhone} />
        </Field>
      </div>
      <Field label="Email (optional, for your receipt)">
        <Input name="customerEmail" type="email" defaultValue={defaultEmail} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="County">
          <Select name="county" required defaultValue="">
            <option value="" disabled>Select county</option>
            {KENYA_COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Town / area">
          <Input name="town" required placeholder="e.g. Westlands" />
        </Field>
      </div>
      <Field label="Delivery address">
        <Textarea name="streetAddress" required rows={2} placeholder="Building, street, landmark" />
      </Field>
      <Field label="Order notes (optional)">
        <Textarea name="notes" rows={2} />
      </Field>

      <Field label="Discount code (optional)">
        <Input name="discountCode" placeholder="e.g. WELCOME10" />
      </Field>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-foreground">Payment method</legend>
        <div className="space-y-2">
          <label className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand/5">
            <input type="radio" name="paymentMethod" value="mpesa" defaultChecked className="accent-[var(--brand)]" />
            Pay with M-Pesa (STK push to your phone)
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand/5">
            <input type="radio" name="paymentMethod" value="cash_on_delivery" className="accent-[var(--brand)]" />
            Cash on delivery
          </label>
        </div>
      </fieldset>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Placing order..." : `Place order - ${formatCurrency(subtotal)}+`}
      </Button>
    </form>
  );
}
