"use client";

import { useActionState } from "react";
import { Field, Input, Textarea } from "@/components/admin/admin-input";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { useSaveToast } from "@/components/admin/use-save-toast";
import type { ActionState } from "@/server/admin-catalog-actions";

// Also used for editing (the "-create-" name is a holdover) - one form,
// same as ProductForm/TeamMemberForm, driven by an `action` + `initial`
// pair rather than duplicating the fields in a second component.
export type CategoryFormInitial = {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

const empty: CategoryFormInitial = {
  name: "",
  description: "",
  imageUrl: "",
  isActive: true,
};

export function CategoryForm({
  action,
  initial = empty,
  submitLabel = "Add category",
  isEdit = false,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: CategoryFormInitial;
  submitLabel?: string;
  isEdit?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  useSaveToast(state, "Category saved");

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Name">
        <Input name="name" required defaultValue={initial.name} />
      </Field>
      <Field label="Description (optional)">
        <Textarea name="description" rows={3} defaultValue={initial.description} />
      </Field>
      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground">Image (optional)</p>
        <ImageUploader
          name="imageUrl"
          folder="categories"
          multiple={false}
          initialImages={initial.imageUrl ? [initial.imageUrl] : []}
        />
      </div>
      {isEdit && (
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="isActive" defaultChecked={initial.isActive} />
          Visible on store
        </label>
      )}
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
