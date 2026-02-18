import Wrapper from "@/app/_components/Wrapper";
import TeamInvitations from "@/components/organizations/TeamInvitations";
import MemberList from "@/components/organizations/MemberList";
import {
  getInvitationsByOrgId,
  getMembersInvitationStatus,
  getOrganizationBySlug,
  getTeams,
} from "@/lib/organization/organization.utils";
import {
  getCurrentUser,
  getUserById,
  getUsersByOrganizationId,
} from "@/lib/user/user.utils";
import { Metadata } from "next/types";
import { Suspense } from "react";
import LoadingIcon from "@/app/_components/LoadingIcon";
import Teams from "@/components/organizations/Teams";

export const metadata: Metadata = {
  title: "Organization Details",
};
export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { currentUser } = await getCurrentUser();
  const organization = await getOrganizationBySlug(slug);

  const [members, invitations, teams] = await Promise.all([
    getMembersInvitationStatus(organization?.id || ""),
    getInvitationsByOrgId(organization?.id || ""),
    getTeams(),
  ]);

  //console.log("org: ", organization);
  // users non présents dans l'organization
  // const users = await getUsersByOrganizationId(organization?.id || "");
  return (
    <Wrapper>
      <div className="my-6">
        <h2 className="font-bold text-3xl">{organization?.name}</h2>
      </div>
      <Suspense fallback={<LoadingIcon />}>
        <Teams teams={teams} organizationId={organization?.id} />
      </Suspense>
      <div className="grid gap-4 sm:grid-cols-2">
        <Suspense fallback={<LoadingIcon />}>
          <MemberList currentUserId={currentUser.id} members={members} />
        </Suspense>
        <Suspense fallback={<LoadingIcon />}>
          <TeamInvitations invitations={invitations} />
        </Suspense>
      </div>
    </Wrapper>
  );
}
