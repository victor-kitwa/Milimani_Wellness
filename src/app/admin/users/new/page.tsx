import { TeamMemberForm } from "@/components/admin/team-member-form";
import { createTeamMember } from "@/server/admin-user-actions";
import { requireAdminPage } from "@/lib/auth";

export const metadata = { title: "Add team member" };

export default async function NewTeamMemberPage() {
  await requireAdminPage();

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-foreground">Add team member</h1>
      <TeamMemberForm action={createTeamMember} submitLabel="Add team member" />
    </div>
  );
}
