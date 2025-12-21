import Wrapper from "@/app/_components/Wrapper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircleIcon } from "lucide-react";
import { Metadata } from "next";
import { getOrganizations } from "@/lib/organization/organization.utils";
import { CreateOrganizationForm } from "@/components/organizations/CreateOrganizationForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Organizations",
};

export default async function Organizations() {
  const organizations = await getOrganizations();
  return (
    <>
      <div className="flex h-96 flex-col items-center justify-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <OrgButton />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Organization</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Create a new organization to get started.
            </DialogDescription>
            <CreateOrganizationForm />
          </DialogContent>
        </Dialog>

        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-2xl">Organizations</h2>
          {organizations.map((org) => (
            <Button asChild key={org.id} variant="outline">
              <Link href={`/dashboard/organizations/${org.slug}`}>
                {org.name}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}

function OrgButton() {
  return (
    <div className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-input border-dashed py-4 px-12 transition-colors hover:bg-accent/50 has-disabled:pointer-events-none has-[input:focus]:border-ring has-[img]:border-none has-disabled:opacity-50 has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50">
      <div className="flex flex-col items-center justify-center py-3 text-center">
        <div
          aria-hidden="true"
          className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
        >
          <PlusCircleIcon className="size-4 opacity-60" />
        </div>
        <p className="mb-1.5 font-medium text-sm">Create your organization !</p>
        <p className="text-muted-foreground text-xs">3 Organizations MAX !</p>
      </div>
    </div>
  );
}
