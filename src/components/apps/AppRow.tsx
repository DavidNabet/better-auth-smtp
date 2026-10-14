import { formatRelativeTime } from "@/lib/utils";
import * as DpMenu from "../ui/dropdown-menu";
import { Folder, MoreVertical, Trash2 } from "lucide-react";
import { App } from "@prisma/client";
import { Button } from "../ui/button";
import Link from "next/link";

export default function AppRow({ app }: { app: App }) {
  return (
    <div className="group flex flex-col justify-between gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary hover:shadow-sm">
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
        <DpMenu.DropdownMenu>
          <DpMenu.DropdownMenuTrigger asChild>
            <Button
              aria-label={`More options for ${app.name}`}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DpMenu.DropdownMenuTrigger>
          <DpMenu.DropdownMenuContent
            align="end"
            collisionPadding={8}
            sideOffset={4}
          >
            <DpMenu.DropdownMenuItem asChild>
              <Link href={`/dashboard/apps/${app.slug}`}>
                <Folder className="size-4" />
                Open
              </Link>
            </DpMenu.DropdownMenuItem>
            <DpMenu.DropdownMenuSeparator />
            <DpMenu.DropdownMenuItem variant="destructive">
              <Trash2 className="size-4" />
              Delete
            </DpMenu.DropdownMenuItem>
          </DpMenu.DropdownMenuContent>
        </DpMenu.DropdownMenu>
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
  );
}
