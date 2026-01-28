import Wrapper from "@/app/_components/Wrapper";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyHeader,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CardButton } from "@/app/_components/Card";
import { ArrowUpRightIcon, FolderCode, PlusIcon } from "lucide-react";
import { Metadata } from "next";
import { getOrganizations } from "@/lib/organization/organization.utils";
import { CreateOrganizationForm } from "@/components/organizations/CreateOrganizationForm";
import Link from "next/link";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { CreateFromButton } from "@/app/_components/CreateFromButton";

export const metadata: Metadata = {
  title: "Organizations",
};

export default async function Organizations() {
  const organizations = await getOrganizations();
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-6">
        <Suspense fallback={<LoadingIcon />}>
          {organizations.length < 3 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderCode />
                </EmptyMedia>
                <EmptyTitle>
                  {organizations.length} Organization
                  {organizations.length > 1 ? "s" : ""} created !
                </EmptyTitle>
                <EmptyDescription>
                  You can create 3 organizations max.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center gap-2">
                <DialogButton />
              </EmptyContent>
            </Empty>
          ) : (
            <DialogButton />
          )}
        </Suspense>

        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-2xl">Organizations</h2>
          <Suspense fallback={<LoadingIcon />}>
            {organizations?.map((org) => (
              <Button asChild key={org.id} variant="outline">
                <Link href={`/dashboard/organizations/${org.slug}`}>
                  {org.name}
                </Link>
              </Button>
            ))}
          </Suspense>
        </div>
      </div>
    </>
  );
}

function DialogButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">
          <PlusIcon /> Add Organization
        </Button>
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
  );
}
