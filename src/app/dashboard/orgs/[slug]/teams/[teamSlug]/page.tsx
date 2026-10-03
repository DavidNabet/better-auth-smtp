import Wrapper from "@/app/_components/Wrapper";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import TeamHeader from "./_components/header";
import MemberListSection from "@/components/organizations/MemberListSection";
import {
  getTeamDetails,
  getTeamMembersWithOrgRole,
} from "@/lib/organization/organization.utils";
import { Suspense } from "react";
import TeamActivityFeed from "@/components/organizations/Activity";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { getCurrentUser } from "@/lib/user/user.utils";
import { getNotificationByOrgId } from "@/lib/notification/notification.utils";

export const metadata: Metadata = {
  title: "Team",
};

export async function generateStaticParams() {
  return [{ slugTeamId: "/^[a-z0-9]+(?:[_-][a-zA-Z0-9]+)*$/" }];
}

async function getTeamsData(teamSlug: string) {
  const team = await getTeamDetails(teamSlug);
  const memberCount = await getTeamMembersWithOrgRole(team?.id || "");
  return { team, memberCount };
}

export default async function TeamDetails(
  props: PageProps<"/dashboard/orgs/[slug]/teams/[teamSlug]">,
) {
  const { teamSlug } = await props.params;
  const orgId = teamSlug.split("-")[1];
  const { currentUser } = await getCurrentUser();

  const [{ team, memberCount }, notifications] = await Promise.all([
    getTeamsData(teamSlug),
    getNotificationByOrgId(orgId),
  ]);

  console.log("Notifications: ", notifications.length);

  if (!team || !memberCount) return;

  return (
    <Wrapper>
      <div className={cn("flex w-full flex-col gap-6 my-6")}>
        <TeamHeader
          logo={team.logo!}
          teamId={team.id}
          teamName={team.name!}
          memberCount={memberCount.length}
          organizationId={team.organization.id}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_350px] lg:gap-8">
        <div>
          <Suspense fallback={<LoadingIcon />}>
            <MemberListSection
              teamId={team.id!}
              currentUserId={currentUser.id}
              memberCount={memberCount.length}
            />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<LoadingIcon />}>
            <TeamActivityFeed activities={notifications} />
          </Suspense>
        </div>
      </div>
    </Wrapper>
  );
}
