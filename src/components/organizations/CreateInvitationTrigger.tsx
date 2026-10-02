"use client";

import { Suspense } from "react";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { CreateInvitation } from "./TeamInvitations";
import { User } from "@/lib/types";

interface CreateInvitationTriggerProps {
  teamId: string;
  organizationId: string;
}

export default function CreateInvitationTrigger({
  teamId,
  organizationId,
}: CreateInvitationTriggerProps) {
  const fetchMembers = async () => {
    const res = await fetch(
      `/api/organizations/${organizationId}/available-members`,
      { cache: "no-cache" },
    );
    if (!res.ok) throw new Error("Failed to fetch available members");
    return res.json() as Promise<{
      users: User[];
      total: number;
    }>;
  };

  return (
    <Suspense fallback={<LoadingIcon />}>
      <CreateInvitation
        teamId={teamId}
        organizationId={organizationId}
        fetchMembers={fetchMembers}
        isTeamMember={true}
      />
    </Suspense>
  );
}
