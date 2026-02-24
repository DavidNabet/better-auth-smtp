"use client";

import { Mail, Trash2, Loader2, Plus, X, RefreshCw } from "lucide-react";
import {
  useActionState,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
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
import { Invitation } from "@prisma/client";
import { cn, formatRelativeTime, getInitials, formatDate } from "@/lib/utils";
import {
  createToastCallbacks,
  withCallbacks,
} from "@/app/_components/ServerActionToast";
import { inviteMember } from "@/lib/organization/organization.action";
import { getInvitationsByOrgId } from "@/lib/organization/organization.utils";

import { toast } from "sonner";
import { ActionState } from "@/lib/feedback/feedback.types";
import { inviteSchema } from "@/lib/organization/organization.schema";

interface TeamInvitationsProps {
  invitations: Awaited<ReturnType<typeof getInvitationsByOrgId>>;
}

function getStatusBadge(status: Invitation["status"]) {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "accepted":
      return <Badge variant="default">Accepted</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
  }
}

function formatTimeUntil(date: Date): string {
  const now = Date.now();
  const diff = date.getTime() - now;

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} day${days !== 1 ? "s" : ""}`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""}`;

  return "Less than an hour";
}

// TODO: Vérifie si un utilisateur existe dans la DB alors proposer l'invitation sinon créer un compte puis l'inviter
export default function TeamInvitations({ invitations }: TeamInvitationsProps) {
  const [orgId, setOrgId] = useState<string | undefined>("");
  const router = useRouter();
  const pendingInvitations = invitations.filter((i) => i.status === "pending");
  const acceptedInvitations = invitations.filter(
    (i) => i.status === "accepted",
  );

  const params = useParams<{ slug: string }>();

  async function fetchOrganizationSlug() {
    try {
      const { data, error } = await authClient.organization.getFullOrganization(
        {
          query: {
            organizationSlug: params.slug,
          },
        },
      );
      if (error) {
        console.error(error.message);
      }
      setOrgId(data?.id);
    } catch (error) {
      console.error("getFullOrganization error: ", error);
    }
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
                {acceptedInvitations.length} accepted
              </CardDescription>
            </div>
            <Button
              variant="outline"
              type="button"
              size="icon"
              onClick={() => router.refresh()}
            >
              <RefreshCw className="size-4" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="w-full shrink-0 md:w-auto"
                  type="button"
                  onClick={fetchOrganizationSlug}
                >
                  <Plus className="size-4" />
                  Create Invitation
                </Button>
              </DialogTrigger>
              <DialogContent className="md:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Invitation</DialogTitle>
                  <DialogDescription>
                    Invite someone to join your team
                  </DialogDescription>
                </DialogHeader>
                {/* <div className="flex flex-col gap-4"> */}
                {orgId && <CreateInvitation organizationId={orgId} />}
                {/* </div> */}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Pas d'invitations, créez-en une maintenant !
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col gap-3 rounded-lg border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {invitation.email ? (
                          <span className="font-medium text-sm">
                            {invitation.email}
                          </span>
                        ) : (
                          <span className="font-medium text-sm">
                            Direct Link
                          </span>
                        )}
                        {getStatusBadge(invitation.status)}
                        <Badge variant="outline">{invitation.role}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                        <span>Invited by {invitation.user.name}</span>
                        {invitation.expiresAt && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>
                              Expires in {formatTimeUntil(invitation.expiresAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {invitation.status === "pending" && (
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
                        <DropdownMenuContent
                          align="end"
                          collisionPadding={8}
                          sideOffset={4}
                        >
                          <DropdownMenuItem>
                            <RefreshCw className="size-4" />
                            Resend
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={async () => {
                              const res =
                                await authClient.organization.cancelInvitation({
                                  invitationId: invitation.id,
                                });
                              if (res.error) {
                                toast.error(res.error.message);
                              } else {
                                toast.success(
                                  "Invitation canceled successfully!!!",
                                );
                              }
                              router.refresh();
                            }}
                          >
                            <Trash2 className="size-4" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateInvitation({ organizationId }: { organizationId?: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const toastCallbacks = createToastCallbacks({
    loading: "Envoyer une invitation...",
  });
  const [state, action, pending] = useActionState(
    withCallbacks(inviteMember, {
      ...toastCallbacks,
      onSuccess(result) {
        toastCallbacks.onSuccess?.(result);
        ref.current?.reset();
      },
    }),
    null,
  );
  return (
    <form
      ref={ref}
      className="overflow-y-auto"
      id="invitationForm"
      action={action}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <input type="hidden" name="organizationId" value={organizationId} />
          <div className="col-span-6">
            <Label htmlFor="email" className="block text-sm font-medium">
              Email
            </Label>
            <Input
              name="email"
              className="my-2 w-full"
              type="email"
              placeholder="johndoe@example.com"
            />
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
