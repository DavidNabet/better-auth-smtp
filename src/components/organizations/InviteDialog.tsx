"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/auth.client";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";

interface InviteDialogProps {
  title: string;
  children: React.ReactNode;
  btnText: string;
}

export default function InviteDialog({
  title,
  children,
  btnText,
}: InviteDialogProps) {
  const { session } = useAuth();
  const [canInvite, setCanInvite] = useState(false);

  useEffect(() => {
    if (!session) {
      setCanInvite(false);
      return;
    }
    authClient.organization
      .hasPermission({
        permissions: { invitation: ["create"] },
      })
      .then((result) => {
        setCanInvite(!result.error && result.data.success !== false);
      })
      .catch(() => {
        setCanInvite(false);
      });
  }, [session]);

  if (!session) return null;
  if (!canInvite) return null;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" />
          {btnText}
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Invite someone to join your team
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
