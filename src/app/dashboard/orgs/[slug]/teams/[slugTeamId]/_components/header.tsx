import InviteDialog from "@/components/organizations/InviteDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface TeamHeaderProps {
  logo?: string;
  teamName: string;
  memberCount: number;
}

export default function TeamHeader({
  logo,
  teamName,
  memberCount,
}: TeamHeaderProps) {
  return (
    <div className="flex flex-col flex-wrap gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="size-12">
          <AvatarImage alt={teamName} src={logo} />
          <AvatarFallback>{getInitials(teamName)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-xl">{teamName} Team</h1>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <InviteDialog title="Invite Member">
          <p>Members</p>
        </InviteDialog>
      </div>
    </div>
  );
}
