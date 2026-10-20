import InviteDialog from "@/components/organizations/InviteDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { CreateInvitation } from "@/components/organizations/TeamInvitations";
import CreateInvitationTrigger from "@/components/organizations/CreateInvitationTrigger";
import Stats from "@/app/dashboard/apps/[slug]/_components/stats";

interface TeamHeaderProps {
  logo?: string;
  teamId: string;
  teamName: string;
  teamDescription?: string;
  memberCount: number;
  organizationId: string;
}

export default function TeamHeader({
  logo,
  teamId,
  teamName,
  memberCount,
  organizationId,
  teamDescription: description,
}: TeamHeaderProps) {
  return (
    <section className="flex w-full flex-col gap-6 my-6">
      <div className="flex flex-col flex-wrap gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage alt={teamName} src={logo} />
            <AvatarFallback>{getInitials(teamName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <h1 className="font-semibold text-xl">{teamName} Team</h1>
            {description && (
              <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InviteDialog title="Add a member" btnText="Add Member">
            <CreateInvitationTrigger
              organizationId={organizationId}
              teamId={teamId}
            />
          </InviteDialog>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Stats
          title="Membres Actifs"
          status="unknown"
          range={`${memberCount} membre${memberCount !== 1 ? "s" : ""}`}
          stat={memberCount}
        />
        <Stats
          title="Applications Assignées"
          status="within"
          range="Nom de l'application"
          stat="1 / 3"
        />
      </div>
    </section>
  );
}
