import { notFound } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminPage } from "@/lib/auth";
import { Card } from "@/components/ui/badge";
import { TeamMemberForm } from "@/components/admin/team-member-form";
import { updateTeamMember, revokeTeamMemberAccess } from "@/server/admin-user-actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { ADMIN_PERMISSIONS, type AdminPermissions } from "@/lib/permissions";

export const metadata = { title: "Edit team member" };

const emptyPermissions: AdminPermissions = Object.fromEntries(
  ADMIN_PERMISSIONS.map((p) => [p, false])
) as AdminPermissions;

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentUser = await requireAdminPage();
  const { id } = await params;
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user || user.role === "customer") notFound();

  const isSelf = currentUser.id === user.id;
  const boundAction = updateTeamMember.bind(null, id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Edit team member</h1>
        {!isSelf && (
          <form action={revokeTeamMemberAccess}>
            <input type="hidden" name="id" value={user.id} />
            <ConfirmSubmitButton
              confirmMessage={`Revoke admin access for ${user.name}? They'll become a regular customer account.`}
              className="text-sm text-danger hover:underline"
            >
              Revoke access
            </ConfirmSubmitButton>
          </form>
        )}
      </div>

      {isSelf ? (
        <Card className="p-5">
          <p className="text-sm text-foreground">This is your own account.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            To change your own role or permissions, ask another admin to update it for you.
          </p>
        </Card>
      ) : (
        <TeamMemberForm
          action={boundAction}
          submitLabel="Save changes"
          isEdit
          initial={{
            name: user.name,
            email: user.email,
            phone: user.phone ?? "",
            role: user.role === "admin" ? "admin" : "staff",
            permissions: (user.permissions as AdminPermissions) ?? emptyPermissions,
          }}
        />
      )}
    </div>
  );
}
