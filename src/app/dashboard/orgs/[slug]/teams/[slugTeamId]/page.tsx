import Wrapper from "@/app/_components/Wrapper";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import TeamHeader from "./_components/header";
import {
  filterMembersByTeam,
  getTeamBySlug,
} from "@/lib/organization/organization.utils";
import { Suspense } from "react";
import TeamActivityFeed, {
  fakeActivityEntries,
} from "@/components/organizations/Activity";
import LoadingIcon from "@/app/_components/LoadingIcon";
import MemberList from "@/components/organizations/MemberList";
import { getCurrentUser } from "@/lib/user/user.utils";

export const metadata: Metadata = {
  title: "Team",
};

export async function generateStaticParams() {
  return [{ slugTeamId: "/^[a-z0-9]+(?:[_-][a-zA-Z0-9]+)*$/" }];
}

export default async function TeamDetails(
  props: PageProps<"/dashboard/orgs/[slug]/teams/[slugTeamId]">,
) {
  const { slugTeamId, slug } = await props.params;
  const name = slugTeamId.split("-")[0];
  const { currentUser } = await getCurrentUser();
  const team = await getTeamBySlug(name);
  const teamMembers = await filterMembersByTeam(team?.id || "");
  return (
    <Wrapper>
      <div className={cn("flex w-full flex-col gap-6 my-6")}>
        <TeamHeader
          logo={team?.logo!}
          members={team?.teamMembers!}
          teamName={team?.name!}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Suspense fallback={<LoadingIcon />}>
            <MemberList
              currentUserId={currentUser.id}
              teamMembers={teamMembers}
              refreshButton={true}
            />
          </Suspense>
        </div>
        <Suspense fallback={<LoadingIcon />}>
          <TeamActivityFeed activities={fakeActivityEntries} />
        </Suspense>
      </div>
    </Wrapper>
  );
}
