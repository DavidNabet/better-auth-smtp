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
import { FolderCode, PlusIcon, ArrowRight } from "lucide-react";
import { Metadata } from "next";
import { getOrganizations } from "@/lib/organization/organization.utils";
import { CreateOrganizationForm } from "@/components/organizations/CreateOrganizationForm";
import Link from "next/link";
import LoadingIcon from "@/app/_components/LoadingIcon";
import Wrapper from "@/app/_components/Wrapper";
import { cn } from "@/lib/utils";
import { Organization } from "@prisma/client";
import { CardButton, CardInner } from "@/app/_components/Card";

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
                  <CardButton
                    key={org.id}
                    icon={<FolderCode />}
                    title={org.name}
                    boxed
                    className="border p-4 rounded-lg gap-4 border-accent-foreground/20"
                    actions={
                      <Button
                        asChild
                        size="icon-sm"
                        variant="outline"
                        className="rounded-full"
                      >
                        <Link href={`/dashboard/organizations/${org.slug}`}>
                          <ArrowRight />
                        </Link>
                      </Button>
                    }
                  />
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
