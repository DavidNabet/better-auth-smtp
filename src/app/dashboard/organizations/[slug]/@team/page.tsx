import MemberList from "@/components/MemberList";
import { auth } from "@/lib/auth";
import {
  getMembersInvitationStatus,
  getActiveOrganization,
} from "@/lib/organization/organization.utils";
import { headers } from "next/headers";

export default async function Team() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const organization = await getActiveOrganization(session?.session.userId!);
  const members = await getMembersInvitationStatus(organization?.id || "");
  return (
    <MemberList currentUserId={session?.session.userId!} members={members} />
  );
}
