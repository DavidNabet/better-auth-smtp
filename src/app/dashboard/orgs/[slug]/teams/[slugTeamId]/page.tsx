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
import TeamActivityFeed, {
  fakeActivityEntries,
} from "@/components/organizations/Activity";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { getCurrentUser } from "@/lib/user/user.utils";

export const metadata: Metadata = {
  title: "Team",
};

export async function generateStaticParams() {
  return [{ slugTeamId: "/^[a-z0-9]+(?:[_-][a-zA-Z0-9]+)*$/" }];
}

async function getTeamsData(name: string) {
  const team = await getTeamDetails(name);
  const memberCount = await getTeamMembersWithOrgRole(team?.id || "");
  return { team, memberCount };
}

export default async function TeamDetails(
  props: PageProps<"/dashboard/orgs/[slug]/teams/[slugTeamId]">,
) {
  const { slugTeamId, slug } = await props.params;
  const name = slugTeamId.split("-")[0];
  const { currentUser } = await getCurrentUser();

  const [{ team, memberCount }] = await Promise.all([getTeamsData(name)]);

  console.log("TeamDetails MemberCount: ", memberCount);

  return (
    <Wrapper>
      <div className={cn("flex w-full flex-col gap-6 my-6")}>
        <TeamHeader
          logo={team?.logo!}
          teamName={team?.name!}
          memberCount={memberCount.length}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_350px] lg:gap-8">
        <div>
          <Suspense fallback={<LoadingIcon />}>
            <MemberListSection
              teamId={team?.id!}
              currentUserId={currentUser.id}
              memberCount={memberCount.length}
            />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<LoadingIcon />}>
            <TeamActivityFeed activities={fakeActivityEntries} />
          </Suspense>
        </div>
      </div>
    </Wrapper>
  );
}
