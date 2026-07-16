import Wrapper from "@/app/_components/Wrapper";
import TeamInvitations from "@/components/organizations/TeamInvitations";
import { getOrganizationBySlug } from "@/lib/organization/organization.utils";
import { getCurrentUser } from "@/lib/user/user.utils";
import { Metadata } from "next/types";
import { Suspense } from "react";
import LoadingIcon from "@/app/_components/LoadingIcon";
import Teams from "@/components/organizations/Teams";
import MemberListTrigger from "@/components/organizations/MemberListTrigger";
import TeamInvitationsSection from "@/components/organizations/TeamInvitationsSection";

export const metadata: Metadata = {
  title: "Organization Details",
};
export default async function OrganizationPage(
  props: PageProps<"/dashboard/orgs/[slug]">,
) {
  const { slug } = await props.params;

  const { currentUser } = await getCurrentUser();
  const organization = await getOrganizationBySlug(slug);

  // /dashboard/org/[orgSlug]/apps/[appSlug]/teams/[teamSlug]-[id]

  // const [invitations, users] = await Promise.all([
  //   getInvitationsByOrgId(organization?.id || ""),
  //   getUsersByOrganizationId(organization?.id || ""),
  // ]);

  // ⚠ TODO: Créer un SKILL.md où je recense toutes les règles (/caveman + GPT) pour améliorer le code et l'afficher côté Shell (Contexte, etc...) + Eviter le surplus de tokens

  return (
    <Wrapper>
      <div className="my-6">
        <h2 className="font-bold text-3xl">{organization?.name}</h2>
      </div>
      <Suspense fallback={<LoadingIcon />}>
        <Teams organizationId={organization!.id} />
      </Suspense>
      <div className="grid gap-4 sm:grid-cols-2">
        <Suspense fallback={<LoadingIcon />}>
          <MemberListTrigger
            teamId={organization!.id}
            currentUserId={currentUser.id}
            memberCount={0}
          />
        </Suspense>
        <Suspense fallback={<LoadingIcon />}>
          <TeamInvitations organizationId={organization?.id!} />
        </Suspense>
      </div>
    </Wrapper>
  );
}
