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
import { Suspense } from "react";
import { CreateAppForm } from "@/components/apps/CreateAppForm";
import {
  getActiveOrganization,
  getOrganizations,
} from "@/lib/organization/organization.utils";
import LoadingIcon from "@/app/_components/LoadingIcon";
import Wrapper from "@/app/_components/Wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getApps } from "@/lib/app/app.utils";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Apps",
};

export default async function Apps() {
  const [organizations, apps] = await Promise.all([
    getOrganizations(),
    getApps(),
  ]);
  return (
    <Wrapper title="Apps">
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex flex-col items-center justify-center mt-6">
            <CreateFromButton title="Create an app !" />
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create an App</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Synchronize your info app to your organization !
          </DialogDescription>
          <Suspense fallback={<LoadingIcon />}>
            <CreateAppForm organizations={organizations} />
          </Suspense>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-2xl">Group Apps</h2>
        <Suspense fallback={<LoadingIcon />}>
          {apps?.map((app) => (
            <Button asChild key={app.id} variant="outline">
              <Link href={`/dashboard/apps/${app.slug}`}>{app.name}</Link>
            </Button>
          ))}
        </Suspense>
      </div>
    </Wrapper>
  );
}
