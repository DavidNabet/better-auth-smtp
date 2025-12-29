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
import { CardButton } from "@/app/_components/Card";
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
      <div className="flex h-[calc(100vh-220px)] flex-col items-center justify-center gap-2">
        <Suspense fallback={<LoadingIcon />}>
          {organizations.length < 3 ? (
            <Dialog>
              <DialogTrigger asChild>
                <CreateFromButton title="Create an organization !">
                  {3 - organizations.length + " Organizations MAX"}
                </CreateFromButton>
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
          ) : (
            <CardButton
              title="Vous avez plus de 3 organisations !"
              boxed
              className="border p-4 rounded-lg gap-4 mb-4 border-accent-foreground/20"
            />
          )}
        </Suspense>

        <div className="flex flex-col gap-2">
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
