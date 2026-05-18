import Wrapper from "@/app/_components/Wrapper";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import TeamHeader from "./_components/header";
import { getTeamBySlug } from "@/lib/organization/organization.utils";

export const metadata: Metadata = {
  title: "Team",
};

export async function generateStaticParams() {
  return [{ slugTeamId: "/^[a-z0-9]+(?:[_-][a-zA-Z0-9]+)*$/" }];
}

export default async function TeamDetails({
  params,
}: {
  params: Promise<{ slugTeamId: string }>;
}) {
  const { slugTeamId } = await params;
  const name = slugTeamId.split("-")[0];
  const team = await getTeamBySlug(name);
  return (
    <Wrapper>
      <div className={cn("flex w-full flex-col gap-6 my-6")}>
        <TeamHeader
          logo={team?.logo!}
          members={team?.teamMembers!}
          teamName={team?.name!}
        />
      </div>
    </Wrapper>
  );
}
