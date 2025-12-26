// Name, slug, description, logo, organization
import { CardButton } from "@/app/_components/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { App } from "@prisma/client";
import { Metadata } from "next";
import { CreateFromButton } from "@/app/_components/CreateFromButton";

export const metadata: Metadata = {
  title: "Apps",
};

export default async function Apps() {
  return (
    <div className="flex h-[calc(100vh-220px)] flex-col items-center justify-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <CreateFromButton title="Create an app !"></CreateFromButton>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create an App</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Synchronize your info app to your organization !
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
