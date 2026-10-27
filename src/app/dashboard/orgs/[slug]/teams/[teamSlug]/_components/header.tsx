import InviteDialog from "@/components/organizations/InviteDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { CreateInvitation } from "@/components/organizations/TeamInvitations";
import CreateInvitationTrigger from "@/components/organizations/CreateInvitationTrigger";
import Stats from "@/app/dashboard/apps/[slug]/_components/stats";
import { Prisma } from "@prisma/client";
import { teamSelect } from "@/lib/organization/organization.utils";

type TeamWithMembersAndApps = Prisma.TeamGetPayload<{
  select: typeof teamSelect;
}>;

interface TeamHeaderProps {
  organizationId: string;
  teamInfo: TeamWithMembersAndApps;
}

// TODO: Mettre des props plus précises pour les stats

export default function TeamHeader({
  organizationId,
  teamInfo,
}: TeamHeaderProps) {
  return (
    <section className="flex w-full flex-col gap-6 my-6">
      <div className="flex flex-col flex-wrap gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage alt={teamInfo?.name} src={teamInfo?.logo!} />
            <AvatarFallback>{getInitials(teamInfo?.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <h1 className="font-semibold text-xl">{teamInfo?.name} Team</h1>
            {teamInfo?.description && (
              <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
                {teamInfo.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InviteDialog title="Add a member" btnText="Add Member">
            <CreateInvitationTrigger
              organizationId={organizationId}
              teamId={teamInfo?.id}
            />
          </InviteDialog>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Stats
          title="Membres Actifs"
          status="unknown"
          range={`${teamInfo?.teamMembers.length} membre${teamInfo?.teamMembers.length !== 1 ? "s" : ""}`}
          stat={teamInfo?.teamMembers.length}
        />
        <Stats
          title="Applications Assignées"
          status="within"
          range={teamInfo?.apps?.map((f) => f.name).concat(",")!}
          stat={`${teamInfo.apps.length} / 3`}
        />
      </div>
    </section>
  );
}
