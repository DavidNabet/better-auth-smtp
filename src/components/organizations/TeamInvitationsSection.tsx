import { Suspense } from "react";
import LoadingIcon from "@/app/_components/LoadingIcon";
import TeamInvitations from "@/components/organizations/TeamInvitations";

interface TeamInvitationsSectionProps {
  organizationId: string;
}

export default async function TeamInvitationsSection({
  organizationId,
}: TeamInvitationsSectionProps) {
  //   const data = await getInvitations(organizationId);
  return (
    <Suspense fallback={<LoadingIcon />}>
      <TeamInvitations organizationId={organizationId} />
    </Suspense>
  );
}
