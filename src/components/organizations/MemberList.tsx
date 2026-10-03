"use client";

import {
  Crown,
  Shield,
  User,
  Users,
  UserCheck,
  MoreVertical,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
  Fragment,
  ReactNode,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
// import { RoleType } from "@/lib/permissions/permissions.utils";
import { authClient } from "@/lib/auth/auth.client";
import { toast } from "sonner";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { hasClientOrgPermission } from "@/lib/permissions/permissions.utils";
import { type Member } from "@/lib/types";

// TODO: Trouver un autre système comme Redux pour ce type de props: isTeamMember

interface MemberListProps {
  teamId: string;
  currentUserId: string;
  initialCount: number;
  isTeamMember: boolean;
  fetchMembers?: (
    id: string,
    cursor?: string,
    limit?: number,
  ) => Promise<{
    members: Member[];
    nextCursor: string | null;
    total: number;
  }>;
}

const ITEM_HEIGHT = 116;
const OVERS_CAN = 5;

async function fetchMembers(teamId: string, cursor?: string, limit = 5) {
  const controller = new AbortController();
  const params = new URLSearchParams({ teamId, limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/team/${teamId}/members?${params}`, {
    signal: controller.signal,
  });
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json() as Promise<{
    members: Member[];
    nextCursor: string | null;
    total: number;
  }>;
}
export default function MemberList({
  teamId,
  currentUserId,
  initialCount,
  isTeamMember,
  fetchMembers: customFetch,
}: MemberListProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);
  const fetcher = customFetch ?? fetchMembers;

  // Virtualizer - only renders visible items
  const virtualizer = useVirtualizer({
    count: members.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: OVERS_CAN,
  });

  // Load more on scroll
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !nextCursor) return;
    setLoading(true);
    try {
      const {
        members: newMembers,
        nextCursor: cursor,
        total,
      } = await fetcher(teamId, nextCursor);
      setMembers((prev) => [...prev, ...newMembers]);
      setNextCursor(cursor);
      setTotal(total);
      setHasMore(!!cursor);
    } catch {
      toast.error("Failed to load more members");
    } finally {
      setLoading(false);
    }
  }, [teamId, loading, hasMore, nextCursor, fetcher]);

  // Inital load
  useEffect(() => {
    const controller = new AbortController();
    fetcher(teamId)
      .then(({ members: initial, nextCursor, total }) => {
        setMembers(initial);
        setNextCursor(nextCursor);
        setTotal(total);
        setHasMore(!!nextCursor);
      })
      .catch((err) => {
        if (err.name === "AbortController") {
          console.log("Fetch MemberList aborted");
        } else {
          console.error("Fetch error: ", err);
        }
      });
    return () => controller.abort();
  }, [teamId, fetcher]);

  const getRoleIcon = useMemo(
    () => (role: string) => {
      switch (role) {
        case "owner":
          return Crown;
        case "admin":
          return Shield;
        case "member":
          return UserCheck;
        default:
          return User;
      }
    },
    [],
  );

  const getRoleBadgeVariant = useMemo(
    () => (role: string) =>
      role === "owner" ? "default" : role === "admin" ? "secondary" : "outline",
    [],
  );

  const handleRoleChange = async (member: Member, newRole: string) => {
    const res = await authClient.organization.updateMemberRole({
      role: newRole,
      memberId: member.id,
    });
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success(`Role updated to ${newRole}`);
      router.refresh();
    }
  };

  const handleRemove = async (member: Member) => {
    const res = await authClient.organization.removeMember({
      memberIdOrEmail: member.email,
      organizationId: member.organizationId,
      fetchOptions: {
        onError(context) {
          if (context.response.status === 401) {
            console.log(hasClientOrgPermission("owner", "member", "delete"));
          }
        },
      },
    });
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Member removed");
      router.refresh();
    }
  };

  const handleTeamMemberRemove = async (member: Member, teamId: string) => {
    // const res = await authClient.organization.removeTeamMember({
    //   teamId,
    //   userId: member.userId,
    // });
    // if (res.error) {
    //   toast.error(res.error.message);
    // } else {
    //   toast.success("Team Member removed");
    //   router.refresh();
    // }

    console.log("handleTeamMemberRemove", member, teamId);
  };

  if (total === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No Members found</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <div
        ref={parentRef}
        className="border rounded-lg"
        onScroll={virtualizer.measure}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <MemberRow
            key={members[virtualRow.index].id}
            member={members[virtualRow.index]}
            currentUserId={currentUserId}
            getRoleIcon={getRoleIcon}
            getRoleVariant={getRoleBadgeVariant}
            onRoleChange={handleRoleChange}
            onRemove={handleRemove}
            onTeamMemberRemove={handleTeamMemberRemove}
            isTeamMember={isTeamMember}
            teamId={teamId}
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center p-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="w-full max-w-xs"
          >
            {loading
              ? "Loading..."
              : `Load more (${total - members.length} remaining)`}
          </Button>
        </div>
      )}
    </>
  );
}

function MemberRow({
  member,
  currentUserId,
  getRoleIcon,
  getRoleVariant,
  onRoleChange,
  onRemove,
  onTeamMemberRemove,
  isTeamMember,
  teamId,
}: {
  member: Member;
  currentUserId: string;
  getRoleIcon: (role: string) => typeof User;
  getRoleVariant: (role: string) => "default" | "secondary" | "outline";
  onRoleChange: (m: Member, role: string) => void;
  onRemove: (m: Member) => void;
  onTeamMemberRemove: (m: Member, t: string) => void;
  isTeamMember: boolean;
  teamId: string;
}) {
  const RoleIcon = getRoleIcon(member.role);
  const isCurrentUser = member.userId === currentUserId;
  const canModify = !isCurrentUser && member.role !== "owner";
  return (
    <div className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage alt={member.name!} src={member.image!} />
            <AvatarFallback>{getInitials(member.name!)}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm truncate">{member.name}</span>
          {isCurrentUser && (
            <Badge className="text-xs" variant="secondary">
              You
            </Badge>
          )}
          <Badge className="text-xs" variant={getRoleVariant(member.role)}>
            <RoleIcon className="mr-1 size-3" />
            {member.role}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">{member.email}</p>
        <div className="flex flex-wrap items-center gap-1 text-muted-foreground text-xs">
          <span>Joined {formatDate(member.createdAt)}</span>
          <span aria-hidden="true">•</span>
          <span>Active {formatRelativeTime(member.updatedAt)}</span>
        </div>
      </div>
      {canModify && (
        <MemberActionsDropdown
          member={member}
          onRoleChange={onRoleChange}
          onRemove={onRemove}
          onTeamMemberRemove={onTeamMemberRemove}
          isTeamMember={isTeamMember}
          teamId={teamId}
        />
      )}
    </div>
  );
}

function MemberActionsDropdown({
  member,
  onRemove,
  onRoleChange,
  onTeamMemberRemove,
  isTeamMember,
  teamId,
}: {
  member: Member;
  onRoleChange: (m: Member, role: string) => void;
  onRemove: (m: Member) => void;
  onTeamMemberRemove: (m: Member, t: string) => void;
  isTeamMember?: boolean;
  teamId: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`More options for ${member.name}`}
          size="icon"
          type="button"
          variant="ghost"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" collisionPadding={8} sideOffset={4}>
        {!isTeamMember ? (
          <>
            {member.role === "member" && (
              <DropdownMenuItem onClick={() => onRoleChange(member, "admin")}>
                <Shield className="size-4" />
                Promote to admin
              </DropdownMenuItem>
            )}
            {member.role === "admin" && (
              <DropdownMenuItem onClick={() => onRoleChange(member, "member")}>
                <UserCheck className="size-4" />
                Demote to Member
              </DropdownMenuItem>
            )}
            {member.role !== "viewer" && <DropdownMenuSeparator />}

            <DropdownMenuItem
              variant="destructive"
              onClick={() => onRemove(member)}
            >
              <Trash2 className="size-4" />
              Remove Member
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onTeamMemberRemove(member, teamId)}
          >
            <Trash2 className="size-4" />
            Remove Team Member
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const MemberHeader = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => {
  const router = useRouter();
  return (
    <Card className="w-full shadow-xs">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button
            variant="outline"
            type="button"
            size="icon"
            onClick={() => router.refresh()}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
