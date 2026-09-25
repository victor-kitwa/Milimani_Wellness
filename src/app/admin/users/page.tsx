import Link from "next/link";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, ne } from "drizzle-orm";
import { Badge, Card } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requireAdminPage } from "@/lib/auth";
import { ADMIN_PERMISSIONS, PERMISSION_LABELS, type AdminPermissions } from "@/lib/permissions";
import { Plus, Pencil } from "lucide-react";

export const metadata = { title: "Team & access" };

export default async function AdminUsersPage() {
  const currentUser = await requireAdminPage();
  const rows = await db
    .select()
    .from(users)
    .where(ne(users.role, "customer"))
    .orderBy(desc(users.createdAt));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Team & access ({rows.length})</h1>
        <ButtonLink href="/admin/users/new">
          <Plus className="h-4 w-4" /> Add team member
        </ButtonLink>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Add staff accounts and choose exactly which sections of the admin dashboard each
        person can use. Admins always have full access, including this page.
      </p>

      <Card className="divide-y divide-border">
        {rows.map((u) => {
          const perms = u.permissions as AdminPermissions | null;
          const grantedLabels =
            u.role === "admin"
              ? ["Full access"]
              : ADMIN_PERMISSIONS.filter((p) => perms?.[p]).map((p) => PERMISSION_LABELS[p].label);
          const isSelf = u.id === currentUser.id;

          return (
            <div key={u.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  {u.name}
                  {isSelf && <Badge tone="brand">You</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge tone={u.role === "admin" ? "brand" : "neutral"}>
                    {u.role === "admin" ? "Admin" : "Staff"}
                  </Badge>
                  {grantedLabels.length === 0 ? (
                    <span className="text-xs text-muted">No sections granted yet</span>
                  ) : (
                    grantedLabels.map((label) => (
                      <Badge key={label} tone="neutral">
                        {label}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              {!isSelf && (
                <Link
                  href={`/admin/users/${u.id}`}
                  aria-label="Edit"
                  title="Edit"
                  className="shrink-0 rounded-md p-1.5 text-brand transition-colors hover:bg-brand/10"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              )}
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">No team members yet.</p>
        )}
      </Card>
    </div>
  );
}
