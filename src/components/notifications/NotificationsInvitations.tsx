"use client";
import { MailWarningIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReactNode } from "react";
import { authClient } from "@/lib/auth/auth.client";
import { toast } from "sonner";
import { APIError } from "better-auth/api";

interface NotificationsInvitationsProps {
  children: ReactNode;
  invitationId?: string;
}

export function NotificationsInvitations({
  children,
  invitationId,
}: NotificationsInvitationsProps) {
  async function handleAccept() {
    try {
      const res = await authClient.organization.acceptInvitation({
        invitationId: invitationId!,
      });
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success("Invitation accepted");
    } catch (error: unknown) {
      if (error instanceof APIError) {
        console.error("Erreur lors de l'acceptation: ", error.message);
      }
      toast.error("Erreur lors de l'acceptation de l'invitation");
      throw error;
    }
  }

  async function handleReject() {
    try {
      const res = await authClient.organization.rejectInvitation({
        invitationId: invitationId!,
      });
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success("Invitation rejected");
    } catch (error: unknown) {
      if (error instanceof APIError) {
        console.error("Erreur lors du rejet: ", error.message);
      }

      toast.error("Erreur lors du rejet de l'invitation");
      throw error;
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="dark:bg-gray-900 dark:text-white bg-secondary border-0">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <MailWarningIcon className="h-5 w-5 text-rose-400" />
            <AlertDialogTitle className="text-primary">
              Respond to Invitation
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-primary">
            You have been invited to join a team. Please accept or decline the
            invitation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <input type="hidden" name="invitationId" value={invitationId} />
          <AlertDialogAction
            className="bg-rose-500 border-rose-500 hover:bg-rose-600 text-white hover:text-white"
            onClick={handleReject}
          >
            Reject
          </AlertDialogAction>
          <AlertDialogAction
            className="bg-green-500 hover:bg-green-600 text-white hover:text-white"
            onClick={handleAccept}
          >
            Accept
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
