"use client";

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
import { ActionButton } from "@/lib/rbac/common/action-button";

import { Plus } from "lucide-react";

interface InviteDialogProps {
  title: string;
  children: React.ReactNode;
}

export default function InviteDialog({ title, children }: InviteDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <ActionButton action={"ban"} className="w-full shrink-0 md:w-auto">
          <Plus className="size-4" />
          {title}
        </ActionButton>
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
