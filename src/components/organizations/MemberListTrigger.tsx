"use client";

import { Suspense } from "react";
import LoadingIcon from "@/app/_components/LoadingIcon";
import MemberList from "@/components/organizations/MemberList";
import { Member } from "@/lib/types";

interface MemberListTriggerProps {
  teamId: string;
  currentUserId: string;
  memberCount: number;
}

export default function MemberListTrigger({
  teamId,
  currentUserId,
  memberCount,
}: MemberListTriggerProps) {
  const fetchOrgMembers = async (
    orgId: string,
    cursor?: string,
    limit?: number,
  ) => {
    const params = new URLSearchParams({
      limit: String(limit ?? 50),
    });
    if (cursor) params.set("cursor", cursor);
    const res = await fetch(`/api/organizations/${orgId}/members?${params}`);
    if (!res.ok) throw new Error("Failed to fetch members");
    return res.json() as Promise<{
      members: Member[];
      nextCursor: string | null;
      total: number;
    }>;
  };
  return (
    <Suspense fallback={<LoadingIcon />}>
      <MemberList
        teamId={teamId}
        currentUserId={currentUserId}
        initialCount={memberCount}
        fetchMembers={fetchOrgMembers}
      />
    </Suspense>
  );
}
