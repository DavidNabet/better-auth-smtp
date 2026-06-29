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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
// import { RoleType } from "@/lib/permissions/permissions.utils";
import { Member } from "@prisma/client";
import { cn, formatRelativeTime, getInitials, formatDate } from "@/lib/utils";
import {
  filterMembersByTeam,
  getMembersInvitationStatus,
} from "@/lib/organization/organization.utils";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { hasClientOrgPermission } from "@/lib/permissions/permissions.utils";
import { useActions } from "@/lib/rbac/common/action-guard";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
} from "@/components/ui/empty";

interface MemberListProps {
  teamMembers?: Awaited<ReturnType<typeof filterMembersByTeam>>;
  members?: Awaited<ReturnType<typeof getMembersInvitationStatus>>;
  currentUserId: string;
  refreshButton: boolean;
}

function getRoleIcon(role: Member["role"]) {
  switch (role) {
    case "owner":
      return Crown;
    case "admin":
      return Shield;
    case "member":
      return UserCheck;
    case "viewer":
      return User;
    default:
      return User;
  }
}

function getRoleBadgeVariant(role: Member["role"]) {
  switch (role) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
}
export default function MemberList({
  teamMembers,
  members,
  currentUserId,
  refreshButton,
}: MemberListProps) {
  const membersList = members || teamMembers;
  const router = useRouter();
  return (
    <Card className="w-full shadow-xs">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Members</CardTitle>
            <CardDescription>
              {membersList?.length} member{membersList?.length !== 1 ? "s" : ""}{" "}
              in your {teamMembers ? "team" : "organization"}
            </CardDescription>
          </div>
          {refreshButton && (
            <Button
              variant="outline"
              type="button"
              size="icon"
              onClick={() => router.refresh()}
            >
              <RefreshCw className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-0 overflow-hidden rounded-lg border">
          {membersList?.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users className="size-6" />
                </EmptyMedia>
                <EmptyTitle>No Members found</EmptyTitle>
              </EmptyHeader>
            </Empty>
          )}
          {membersList?.map((member, idx) => {
            const RoleIcon = getRoleIcon(member.role);
            // const { canPerform } = useActions();
            const isCurrentUser = member.userId === currentUserId;
            const canModify = !isCurrentUser && member.role !== "owner";

            return (
              <div key={member.id}>
                <div className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50">
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-2 font-medium text-sm">
                        <Avatar className="size-8">
                          <AvatarImage alt={member.name!} src={member.image!} />
                          <AvatarFallback>
                            {getInitials(member.name!)}
                          </AvatarFallback>
                        </Avatar>
                        {member.name}
                      </span>
                      {isCurrentUser && (
                        <Badge className="text-xs" variant="secondary">
                          You
                        </Badge>
                      )}
                      <Badge
                        className="text-xs"
                        variant={getRoleBadgeVariant(member.role)}
                      >
                        <RoleIcon className="mr-1 size-3" />
                        {member.role}
                      </Badge>
                      {/* {member.status === "pending" && (
                        <Badge className="text-xs" variant="outline">
                          Waiting
                        </Badge>
                      )}
                      {member.status === "rejected" && (
                        <Badge className="text-xs" variant="destructive">
                          Rejected
                        </Badge>
                      )} */}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {member.email}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 text-muted-foreground text-xs">
                      <span>Joined {formatDate(member.createdAt)}</span>
                      {member?.updatedAt && (
                        <>
                          <span aria-hidden="true">•</span>
                          <span>
                            Active {formatRelativeTime(member.updatedAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {canModify && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-label={`More options for ${member.name}`}
                          size="icon"
                          type="button"
                          variant="ghost"
                          id="more-options"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        collisionPadding={8}
                        sideOffset={4}
                      >
                        {member.role === "member" && (
                          <DropdownMenuItem
                            onClick={async () => {
                              const res =
                                await authClient.organization.updateMemberRole({
                                  role: "admin",
                                  memberId: member.id,
                                });
                              if (res.error) {
                                toast.error(res.error.message);
                              } else {
                                toast.success("Role updated to admin");
                              }
                              router.refresh();
                            }}
                          >
                            <Shield className="size-4" />
                            Promote to admin
                          </DropdownMenuItem>
                        )}
                        {member.role === "admin" && (
                          <DropdownMenuItem
                            onClick={async () => {
                              const res =
                                await authClient.organization.updateMemberRole({
                                  role: "member",
                                  memberId: member.id,
                                });
                              if (res.error) {
                                toast.error(res.error.message);
                              } else {
                                toast.success("Role updated to member");
                              }
                              router.refresh();
                            }}
                          >
                            <UserCheck className="size-4" />
                            Demote to Member
                          </DropdownMenuItem>
                        )}
                        {/* {member.status === "pending" && (
                          <DropdownMenuItem>
                            <Mail className="size-4" />
                            Resend Invitation
                          </DropdownMenuItem>
                        )} */}
                        {member.role !== "viewer" && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={async () => {
                            const res =
                              await authClient.organization.removeMember({
                                memberIdOrEmail: member.email,
                                organizationId: member.organizationId,
                                fetchOptions: {
                                  onError(context) {
                                    if (context.response.status === 401) {
                                      console.log(
                                        hasClientOrgPermission(
                                          "owner",
                                          "member",
                                          "delete",
                                        ),
                                      );
                                    }
                                  },
                                },
                              });
                            if (res.error) {
                              toast.error(res.error.message);
                            } else {
                              toast.success("Member removed successfully");
                            }
                            router.refresh();
                          }}
                        >
                          <Trash2 className="size-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {idx < membersList.length - 1 && <Separator />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
