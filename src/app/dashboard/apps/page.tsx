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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { cn, formatRelativeTime } from "@/lib/utils";
import { Folder, MoreVertical, Plus, Trash2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Apps",
};

export default async function Apps() {
  const [organizations, apps] = await Promise.all([
    getOrganizations(),
    getApps(),
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
              <p className="text-muted-foreground text-sm gap-3">
                <Folder className="size-6" /> Aucune app trouvé
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {apps.map((app) => (
                  <div
                    className="group flex flex-col justify-between gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary hover:shadow-sm"
                    key={app.id}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex size-10 items-center justify-center rounded-lg"
                          style={{ backgroundColor: "ButtonHighlight" }}
                        >
                          {!app.logo ? (
                            <span className="text-lg">{app.logo}</span>
                          ) : (
                            <Folder className="size-5" />
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <h3 className="font-semibold text-base leading-tight">
                            {app.name}
                          </h3>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-label={`More options for ${app.name}`}
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          collisionPadding={8}
                          sideOffset={4}
                        >
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/apps/${app.slug}`}>
                              <Folder className="size-4" />
                              Open
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {app.description && (
                      <p className="line-clamp-2 text-muted-foreground text-sm">
                        {app.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        Updated {formatRelativeTime(app.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>
    </>
  );
}
