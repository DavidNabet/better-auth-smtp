import { Suspense } from "react";
import LoadingIcon from "@/app/_components/LoadingIcon";
import MemberList, {
  MemberHeader,
} from "@/components/organizations/MemberList";

interface MemberListSectionProps {
  teamId: string;
  currentUserId: string;
  memberCount: number;
}

export default function MemberListSection({
  teamId,
  currentUserId,
  memberCount,
}: MemberListSectionProps) {
  return (
    <Suspense fallback={<LoadingIcon />}>
      <MemberHeader
        title="Tous nos membres"
        description="Membre inscrits dans l'équipe"
      >
        <MemberList
          teamId={teamId}
          currentUserId={currentUserId}
          initialCount={memberCount}
          isTeamMember={true}
        />
      </MemberHeader>
    </Suspense>
  );
}
