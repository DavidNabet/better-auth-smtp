import AvatarUpload from "@/components/AvatarUpload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { Plus } from "lucide-react";

interface HeaderTeamProps {
  logo?: string;
  teamName: string;
  members: {
    id: string;
    createdAt: Date;
    userId: string;
    teamId: string;
  }[];
}

export default function TeamHeader({
  logo,
  teamName,
  members,
}: HeaderTeamProps) {
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
              {members.length} member{members.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button">
          <Plus className="size-4" />
          Invite Member
        </Button>
      </div>
    </div>
  );
}
