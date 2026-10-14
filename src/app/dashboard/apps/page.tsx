import { Metadata } from "next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Suspense } from "react";
import { CreateAppForm } from "@/components/apps/CreateAppForm";
import { getOrganizations } from "@/lib/organization/organization.utils";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { Button } from "@/components/ui/button";
import { getAllApps } from "@/lib/app/app.utils";
import { cn } from "@/lib/utils";
import { Plus, Folder } from "lucide-react";
import AppRow from "@/components/apps/AppRow";
import * as Emp from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "Apps",
};

export default async function Apps() {
  const [organizations, apps] = await Promise.all([
    getOrganizations(),
    getAllApps(),
  ]);
  return (
    <>
      <Card className={cn("w-full shadow-transparent mt-6 border-transparent")}>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col flex-wrap gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <CardTitle className="text-2xl">Apps</CardTitle>
                <CardDescription>
                  {apps.length} app{apps.length !== 1 ? "s" : ""} created
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="w-full shrink-0 md:w-auto"
                    type="button"
                    variant="default"
                  >
                    <Plus className="size-4" />
                    New App
                  </Button>
                </DialogTrigger>
                <DialogContent className="md:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create App</DialogTitle>
                    <DialogDescription>
                      Create a new app project workspace
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <CreateAppForm organizations={organizations} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingIcon />}>
            {apps.length === 0 ? (
              <Emp.Empty>
                <Emp.EmptyHeader>
                  <Emp.EmptyMedia variant="icon">
                    <Folder />
                  </Emp.EmptyMedia>
                  <Emp.EmptyTitle>
                    You don&apos;t have any apps yet !
                  </Emp.EmptyTitle>
                  <Emp.EmptyDescription>
                    You can create app who serves for everyone
                  </Emp.EmptyDescription>
                </Emp.EmptyHeader>
              </Emp.Empty>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {apps.map((app) => (
                  <AppRow app={app} key={app.id} />
                ))}
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>
    </>
  );
}
