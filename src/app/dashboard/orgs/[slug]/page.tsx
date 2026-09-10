import Wrapper from "@/app/_components/Wrapper";
// import TeamInvitations from "@/components/organizations/TeamInvitations";
import {
  getOrganizationBySlug,
  getOrganizations,
} from "@/lib/organization/organization.utils";
import { getCurrentUser } from "@/lib/user/user.utils";
import { unstable_cache } from "next/cache";
import { Metadata } from "next/types";
import { Suspense } from "react";
import LoadingIcon from "@/app/_components/LoadingIcon";
import Teams from "@/components/organizations/Teams";
import MemberListTrigger from "@/components/organizations/MemberListTrigger";
// import TeamInvitationsSection from "@/components/organizations/TeamInvitationsSection";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Organization Details",
};
const TeamInvitations = dynamic(
  () => import("@/components/organizations/TeamInvitations"),
);

// Cache avec tag explicite pour invalidation ciblée
const getCachedOrganization = unstable_cache(
  getOrganizationBySlug,
  ["organization-by-slug"],
  {
    tags: ["organization"],
    revalidate: 60, // 1 min, ou plus long selon besoins
  },
);

const getCachedUserOrgs = unstable_cache(
  getOrganizations,
  ["user-organizations"],
  { tags: ["organizations"], revalidate: 300 },
);

export default async function OrganizationPage(
  props: PageProps<"/dashboard/orgs/[slug]">,
) {
  const { slug } = await props.params;

  // /dashboard/org/[orgSlug]/apps/[appSlug]/teams/[teamSlug]-[id]

  const [organization, currentUser] = await Promise.all([
    getOrganizationBySlug(slug),
    getCurrentUser().then((r) => r.currentUser),
  ]);

  const isMember = organization?.members.some(
    (m) => m.userId === currentUser.id,
  );

  // Côté serveur -> revalidateTag, revalidatePath fonctionne avec un fetch et use_cache
  // Côté client -> après une mutation, utiliser react-query pour invalider les résultats

  if (!organization) {
    return (
      <div className="container py-12 text-center">
        Organization introuvable
      </div>
    );
  }

  if (!isMember) {
    return <div className="container py-12 text-center">Accès refusé</div>;
  }

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
          <TeamInvitations organizationId={organization!.id} />
        </Suspense>
      </div>
    </Wrapper>
  );
}
