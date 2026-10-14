import { CardButton } from "@/app/_components/Card";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as Emp from "@/components/ui/empty";
import { App } from "@prisma/client";
import { Suspense } from "react";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { ArrowRight, Folder, Plus } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const getAppIcon = (name: string) => {
  switch (name) {
    default:
      return Folder;
  }
};

export default function AppsList({
  organizationId,
  apps,
}: {
  organizationId?: string;
  apps: Pick<App, "id" | "logo" | "name" | "slug">[];
}) {
  return (
    <Card className={cn("w-full shadow-transparent mt-6 border-transparent")}>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col flex-wrap gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <CardTitle className="text-2xl">Active Applications</CardTitle>
              <CardDescription>
                Quick access to your managed software (3 app limit)
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<LoadingIcon />}>
          {apps?.length === 0 ? (
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
            <div className="grid gap-4 md:grid-cols-3">
              {apps?.map((app) => {
                const AppIcon = getAppIcon(app?.logo!);
                return (
                  <CardButton
                    icon={<AppIcon />}
                    key={app.id}
                    boxed
                    title={app.name}
                    actions={
                      <Button
                        asChild
                        size="icon-sm"
                        variant="outline"
                        className="rounded-full"
                      >
                        <Link href={`/dashboard/apps/${app.slug}`}>
                          <ArrowRight />
                        </Link>
                      </Button>
                    }
                  />
                );
              })}
              <>
                {apps?.length <= 2 && (
                  <Card className="border-2 border-dashed border-slate-300 flex flex-row justify-center items-center hover:border-slate-500 transition">
                    <Link
                      href="/dashboard/apps"
                      className="inline-flex gap-2 items-center"
                    >
                      <Plus className="size-4 " />
                      Add App Slot
                    </Link>
                  </Card>
                )}
              </>
            </div>
          )}
        </Suspense>
      </CardContent>
    </Card>
  );
}
