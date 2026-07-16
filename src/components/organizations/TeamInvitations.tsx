"use client";

import { Mail, Trash2, Loader2, Plus, X, RefreshCw } from "lucide-react";
import {
  Suspense,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
} from "@/components/ui/empty";
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
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth.client";
import { useRouter } from "next/navigation";
import {
  cn,
  formatRelativeTime,
  getInitials,
  formatDate,
  capitalize,
} from "@/lib/utils";
import {
  createToastCallbacks,
  withCallbacks,
} from "@/app/_components/ServerActionToast";
import {
  inviteMember,
  revalidateInvitations,
} from "@/lib/organization/organization.action";

import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import { ActionButton } from "@/lib/rbac/common/action-button";
import InviteDialog from "./InviteDialog";
import type { Invitation, User } from "@/lib/types";
import { useVirtualizer } from "@tanstack/react-virtual";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { router } from "better-auth/api";
// import type { Invitation as Invite } from "@prisma/client";

interface TeamInvitationsProps {
  organizationId: string;
}

function formatTimeUntil(date: Date): string {
  const d = new Date(date);
  const now = Date.now();
  const diff = d.getTime() - now;

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} day${days !== 1 ? "s" : ""}`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""}`;

  return "Less than an hour";
}

// UPDATE (NON): Vérifie si un utilisateur existe dans la DB alors proposer l'invitation sinon créer un compte puis l'inviter
export default function TeamInvitations({
  organizationId,
}: TeamInvitationsProps) {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const invitesRef = useRef<HTMLDivElement>(null);

  async function fetchInvitations(cursor?: string, limit = 5) {
    const params = new URLSearchParams({
      limit: String(limit),
    });
    if (cursor) params.set("cursor", cursor);
    const res = await fetch(
      `/api/organizations/${organizationId}/invitations?${params}`,
      {
        next: { tags: [`invitations:${organizationId}`] },
      },
    );
    if (!res.ok) throw new Error("Failed to fetch invitations");
    return res.json() as Promise<{
      invitations: Invitation[];
      nextCursor: string | null;
      total: number;
    }>;
  }

  // Virtualizer - only renders visible items
  const virtualizer = useVirtualizer({
    count: invitations.length,
    getScrollElement: () => invitesRef.current,
    estimateSize: () => 130,
    overscan: 5,
  });

  useEffect(() => {
    if (!organizationId) return;
    fetchInvitations().then(({ invitations: initial, nextCursor, total }) => {
      setInvitations(initial);
      setNextCursor(nextCursor);
      setTotal(total);
      setHasMore(!!nextCursor);
    });
  }, [organizationId]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !nextCursor) return;
    setLoading(true);
    try {
      const {
        invitations: newInvitations,
        nextCursor: cursor,
        total,
      } = await fetchInvitations(nextCursor);
      setInvitations((prev) => [...prev, ...newInvitations]);
      setNextCursor(cursor);
      setTotal(total);
      setHasMore(!!cursor);
    } catch (error) {
      toast.error("Failed to load more invitations");
    } finally {
      setLoading(false);
    }
  }, [organizationId, loading, hasMore, nextCursor]);

  // const refresh = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const data = await fetchInvitations();
  //     setInvitations(data.invitations);
  //     setNextCursor(data.nextCursor);
  //     setTotal(data.total);
  //     setHasMore(!!data.nextCursor);
  //   } catch (error) {
  //     console.error("Refresh went wrong: ", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [organizationId]);

  const pendingInvitations = invitations.filter((i) => i.status === "pending");

  const acceptedInvitations = invitations.filter(
    (i) => i.status === "accepted",
  );

  const canceledInvitations = invitations.filter(
    (i) => i.status === "canceled",
  );

  const getStatusVariant = useMemo(
    () => (status: string) =>
      status === "pending" || status === "canceled"
        ? "secondary"
        : status === "rejected"
          ? "destructive"
          : "default",
    [],
  );

  const getStatusColor = useMemo(
    () => (status: string) =>
      status === "canceled"
        ? "bg-orange-500 text-white"
        : status === "rejected"
          ? "text-white"
          : "inherit",
    [],
  );

  const handleCancel = async (invitation: Invitation) => {
    const res = await authClient.organization.cancelInvitation({
      invitationId: invitation.id,
    });
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Invitation canceled successfully!!!");
      await refreshRevalidate(organizationId);
    }
  };

  const refreshRevalidate = async (organizationId: string) => {
    await revalidateInvitations(organizationId);
    router.refresh();
  };

  if (total === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Mail className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No Invitations found</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="relative">
      <Card className="w-full shadow-xs h-full">
        <CardHeader>
          <div className="flex flex-col flex-wrap gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                {pendingInvitations.length} pending,{" "}
                {acceptedInvitations.length} accepted,{" "}
                {canceledInvitations.length} cancelled
              </CardDescription>
            </div>
            <Button
              variant="outline"
              type="button"
              size="icon"
              onClick={async () => await refreshRevalidate(organizationId)}
            >
              <RefreshCw className="size-4" />
            </Button>
            <InviteDialog title="Create Invitation">
              {organizationId && (
                <CreateInvitation organizationId={organizationId} />
              )}
            </InviteDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={invitesRef}
            className="flex flex-col gap-4"
            onScroll={virtualizer.measure}
          >
            <div style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((virtualRow) => (
                <InvitationRow
                  key={invitations[virtualRow.index].id}
                  invitation={invitations[virtualRow.index]}
                  getStatusVariant={getStatusVariant}
                  getStatusColor={getStatusColor}
                  onCancel={handleCancel}
                />
              ))}
            </div>
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
                  ? "Loading"
                  : `Load more (${total - invitations.length})`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InvitationRow({
  invitation,
  getStatusVariant,
  getStatusColor,
  onCancel,
}: {
  invitation: Invitation;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive";
  getStatusColor: (
    status: string,
  ) => "bg-orange-500 text-white" | "text-white" | "inherit";
  onCancel: (i: Invitation) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {invitation.email ? (
              <span className="font-medium text-sm">{invitation.email}</span>
            ) : (
              <span className="font-medium text-sm">Direct Link</span>
            )}
            <Badge
              variant={getStatusVariant(invitation.status)}
              className={cn(getStatusColor(invitation.status))}
            >
              {capitalize(invitation.status)}
            </Badge>
            <Badge variant="outline">{invitation.role}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
            <span>Invited by {invitation.user.name}</span>
            {invitation.expiresAt && (
              <>
                <span aria-hidden="true">•</span>
                <span>Expires in {formatTimeUntil(invitation.expiresAt)}</span>
              </>
            )}
          </div>
        </div>
        {invitation.status === "pending" && (
          <InvitationActionsDropdown
            invitation={invitation}
            onCancel={onCancel}
          />
        )}
      </div>
    </div>
  );
}

function InvitationActionsDropdown({
  invitation,
  onCancel,
}: {
  invitation: Invitation;
  onCancel: (i: Invitation) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="More options"
          size="icon"
          type="button"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" collisionPadding={8} sideOffset={4}>
        <DropdownMenuItem>
          <RefreshCw className="size-4" />
          Resend
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onCancel(invitation)}
        >
          <Trash2 className="size-4" />
          Cancel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CreateInvitation({
  organizationId,
}: {
  organizationId?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toastCallbacks = createToastCallbacks({
    loading: "Envoyer une invitation...",
  });
  const [state, action, pending] = useActionState(
    withCallbacks(inviteMember, {
      ...toastCallbacks,
      onSuccess(result) {
        toastCallbacks.onSuccess?.(result);
        formRef.current?.reset();
      },
    }),
    null,
  );

  const [isChecked, setIsChecked] = useState<boolean>(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/available-users`,
        { cache: "no-cache" },
      );
      if (!res.ok) throw new Error("Failed to fetch available users");
      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!organizationId) return;
    fetchUsers();
  }, [organizationId]);

  return (
    <form
      ref={formRef}
      className="overflow-y-auto"
      id="invitationForm"
      action={action}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <input type="hidden" name="organizationId" value={organizationId} />
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              id="check-email"
              onCheckedChange={(prev) => setIsChecked(!prev)}
            />
            <Label htmlFor="check-email">Choisi un email ou saisi-en un</Label>
          </div>
          <div className="col-span-6">
            <Label htmlFor="email" className="block text-sm font-medium">
              Email
            </Label>

            {!isChecked ? (
              <Suspense fallback={<LoadingIcon />}>
                <Select name="email">
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Users in db" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.email}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Suspense>
            ) : (
              <Input
                name="email"
                aria-hidden
                className="my-2 w-full"
                type="email"
                placeholder="johndoe@example.com"
              />
            )}

            <ErrorMessages errors={state?.errorMessage?.email ?? null} />
          </div>
          <div className="col-span-6">
            <Label
              htmlFor="roleMember"
              className="block text-sm font-medium mb-2"
            >
              Role
            </Label>
            <Select name="role" defaultValue="member">
              <SelectTrigger id="roleMember" className="mt-1">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-2 text-muted-foreground text-sm">
              Members can create content, admins can manage the team
            </p>
            <ErrorMessages errors={state?.errorMessage?.role ?? null} />
          </div>
        </div>
        <DialogFooter className="mt-6 col-span-6 gap-x-6">
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button
            type="submit"
            form="invitationForm"
            variant="default"
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Mail className="size-4" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    </form>
  );
}
