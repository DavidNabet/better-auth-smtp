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
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { FolderCode, PlusIcon } from "lucide-react";
import { Metadata } from "next";
import { getOrganizations } from "@/lib/organization/organization.utils";
import { CreateOrganizationForm } from "@/components/organizations/CreateOrganizationForm";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { cn } from "@/lib/utils";
import { OrganizationCard } from "@/components/organizations/OrganizationCard";

export const metadata: Metadata = {
  title: "Organizations",
};

export default async function Organizations() {
  const organizations = await getOrganizations();
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-6">
        <Suspense fallback={<LoadingIcon />}>
          {organizations.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderCode />
                </EmptyMedia>
                <EmptyTitle>You don't have any organizations yet !</EmptyTitle>
                <EmptyDescription>
                  You can create 3 organizations max.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center gap-2">
                <DialogButton />
              </EmptyContent>
            </Empty>
          )}
        </Suspense>

        <Card
          className={cn("w-full shadow-transparent mt-6 border-transparent")}
        >
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col flex-wrap gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <CardTitle className="text-2xl">Your Organizations</CardTitle>
                  <CardDescription>
                    {organizations.length} organization
                    {organizations.length !== 1 ? "s" : ""} created
                  </CardDescription>
                </div>
                <DialogButton />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingIcon />}>
              <div className="grid gap-4 md:grid-cols-3">
                {organizations?.map((org) => (
                  <OrganizationCard org={org} key={org.id} />
                ))}
              </div>
            </Suspense>
          </CardContent>
        </Card>
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
