"use client";

import { useActionState, useState } from "react";
import { Field, Input, Select, Label } from "@/components/admin/admin-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { ADMIN_PERMISSIONS, PERMISSION_LABELS, type AdminPermissions } from "@/lib/permissions";
import { useSaveToast } from "@/components/admin/use-save-toast";
import type { ActionState } from "@/server/admin-user-actions";

export type TeamMemberFormInitial = {
  name: string;
  email: string;
  phone: string;
  role: "staff" | "admin";
  permissions: AdminPermissions;
};

const empty: TeamMemberFormInitial = {
  name: "",
  email: "",
  phone: "",
  role: "staff",
  permissions: {
    manageProducts: false,
    manageCategories: false,
    manageOrders: false,
    manageDiscounts: false,
    viewReports: false,
  },
};

export function TeamMemberForm({
  action,
  initial = empty,
  submitLabel = "Add team member",
  isEdit = false,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: TeamMemberFormInitial;
  submitLabel?: string;
  isEdit?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  useSaveToast(state, "Team member saved");
  // Controlled just for this one field, so the permission checklist below
  // can hide itself the moment "Admin" is picked — admins get full access
  // implicitly, so showing checkboxes for it would be misleading.
  const [role, setRole] = useState<"staff" | "admin">(initial.role);

  return (
    <form action={formAction} className="space-y-6">
      <Card className="space-y-4 p-5">
        <Field label="Full name">
          <Input name="name" required defaultValue={initial.name} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <Input name="email" type="email" required defaultValue={initial.email} />
          </Field>
          <Field label="Phone (optional)">
            <Input name="phone" defaultValue={initial.phone} />
          </Field>
        </div>
        <Field
          label={isEdit ? "New password (optional)" : "Password"}
          hint={isEdit ? "Leave blank to keep their current password" : "At least 6 characters"}
        >
          <Input name="password" type="password" required={!isEdit} minLength={6} />
        </Field>
      </Card>

      <Card className="space-y-4 p-5">
        <p className="text-sm font-semibold text-foreground">Role & access</p>
        <Field label="Role" hint="Admins have full access to every section, including team management.">
          <Select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as "staff" | "admin")}
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>

        {role === "staff" && (
          <div>
            <Label>Permissions</Label>
            <p className="mb-2 text-xs text-muted-foreground">
              Choose exactly which sections this person can see and use.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ADMIN_PERMISSIONS.map((perm) => (
                <label
                  key={perm}
                  className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-sm text-foreground"
                >
                  <input
                    type="checkbox"
                    name={perm}
                    defaultChecked={initial.permissions[perm]}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block font-medium">{PERMISSION_LABELS[perm].label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {PERMISSION_LABELS[perm].description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </Card>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
