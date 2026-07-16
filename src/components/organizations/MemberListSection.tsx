import { Suspense } from "react";
import LoadingIcon from "@/app/_components/LoadingIcon";
import MemberList from "@/components/organizations/MemberList";
import { Member } from "@/lib/types";

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
      <MemberList
        teamId={teamId}
        currentUserId={currentUserId}
        initialCount={memberCount}
      />
    </Suspense>
  );
}
