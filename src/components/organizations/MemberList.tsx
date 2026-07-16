"use client";

import {
  Crown,
  Mail,
  Shield,
  User,
  Users,
  UserCheck,
  Loader2,
  MoreVertical,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState, useRef, useCallback, useEffect } from "react";
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
import { cn, getInitials } from "@/lib/utils";
import { hasClientOrgPermission } from "@/lib/permissions/permissions.utils";
import { type Member } from "@/lib/types";

interface MemberListProps {
  teamId: string;
  currentUserId: string;
  initialCount: number;
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
  const params = new URLSearchParams({ teamId, limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/team/${teamId}/members?${params}`);
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
  }, [teamId, loading, hasMore, nextCursor]);

  // Inital load
  useEffect(() => {
    fetcher(teamId).then(({ members: initial, nextCursor, total }) => {
      setMembers(initial);
      setNextCursor(nextCursor);
      setTotal(total);
      setHasMore(!!nextCursor);
    });
  }, [teamId]);

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
    <Card className="w-full shadow-xs">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Membres inscrits dans votre équipe
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* {idx < membersList.length - 1 && <Separator />} */}
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
      </CardContent>
    </Card>
  );
}

function MemberRow({
  member,
  currentUserId,
  getRoleIcon,
  getRoleVariant,
  onRoleChange,
  onRemove,
}: {
  member: Member;
  currentUserId: string;
  getRoleIcon: (role: string) => typeof User;
  getRoleVariant: (role: string) => "default" | "secondary" | "outline";
  onRoleChange: (m: Member, role: string) => void;
  onRemove: (m: Member) => void;
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
        />
      )}
    </div>
  );
}

function MemberActionsDropdown({
  member,
  onRemove,
  onRoleChange,
}: {
  member: Member;
  onRoleChange: (m: Member, role: string) => void;
  onRemove: (m: Member) => void;
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
