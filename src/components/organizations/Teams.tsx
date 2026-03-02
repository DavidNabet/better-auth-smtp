"use client";

import { Team } from "@prisma/client";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import {
  AvatarGroup,
  AvatarFallback,
  AvatarGroupCount,
  AvatarImage,
  Avatar,
} from "@/components/ui/avatar";
import {
  Shield,
  MessageCircle,
  MoreVertical,
  Trash2,
  Folder,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getTeams } from "@/lib/organization/organization.utils";
import { useActionState } from "react";
import {
  createToastCallbacks,
  withCallbacks,
} from "@/app/_components/ServerActionToast";
import { createTeam } from "@/lib/organization/organization.action";
import { Label } from "../ui/label";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface TeamsProps {
  teams: Awaited<ReturnType<typeof getTeams>>;
  organizationId?: string;
}

const tab = [
  {
    id: 1,
    name: "Admin Team",
    description: "Team for project A",
    icon: <Shield className="size-5 text-amber-500" />,
    members: [
      {
        id: 1,
        name: "John Doe",
        image: "https://github.com/maxleiter.png",
        role: "member",
      },
      {
        id: 2,
        name: "Jane Smith",
        image: "https://github.com/shadcn.png",
        role: "admin",
      },
    ],
  },
  {
    id: 2,
    name: "Moderation Team",
    description: "Team for project B",
    icon: <MessageCircle className="size-5 text-indigo-500" />,
    members: [
      {
        id: 1,
        name: "John Doe",
        image: "https://github.com/maxleiter.png",
        role: "member",
      },
      {
        id: 2,
        name: "Jane Smith",
        image: "https://github.com/shadcn.png",
        role: "admin",
      },
    ],
  },
];

// TODO: Ajouter une admin Team (roles: owner et admin) et une moderation Team (roles: owner, admin, member) à chaque création d'une organization par défaut

// TODO: Paramétrer les permissions s'il s'agit d'une team Admin, on procède aux permissions lié à cet effet, également pour une team moderation

// TODO: Ajouter coté client un sélecteur pour sélectionner des membres dans la team avec un Drawer
export default function Teams({ teams, organizationId }: TeamsProps) {
  return (
    <Card className={cn("w-full shadow-xs my-6")}>
      <CardHeader>
        <div className="flex flex-col flex-wrap gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <CardTitle className="text-2xl">Organizations Teams</CardTitle>
            <CardDescription>
              Manage functional groups and their scoped permissions.
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
                Create a team
              </Button>
            </DialogTrigger>
            <DialogContent className="md:max-w-md">
              <DialogHeader>
                <DialogTitle>Créez une nouvelle team</DialogTitle>
                <DialogDescription>
                  Ajouter une nouvelle team à votre organization
                </DialogDescription>
              </DialogHeader>
              <div>
                {organizationId && (
                  <CreateTeamForm organizationId={organizationId} />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tab.map((t) => (
            <div
              className="flex flex-col p-6 rounded-lg hover:border-primary transition-colors group border bg-card"
              key={t.id}
            >
              <div className="flex justify-between items-start mb-6">
                <Button
                  size="icon-lg"
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                >
                  {t.icon}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label={`More options for ${t.name}`}
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
                      <Link href="#">
                        <Folder className="size-4" />
                        Open
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <Trash2 className="size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="font-bold text-lg mb-2">{t.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8 h-10 overflow-hidden line-clamp-2">
                {t.description}
              </p>
              <Separator />
              <div className="mt-auto pt-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <>
                    {t.members.length === 0 ? (
                      "Empty"
                    ) : (
                      <AvatarGroup>
                        {t.members.map((m) => (
                          <Avatar key={m.id}>
                            <AvatarImage src={m.image} alt={m.name} />
                            <AvatarFallback>
                              {getInitials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        <AvatarGroupCount className="bg-muted">
                          +{t.members.length}
                        </AvatarGroupCount>
                      </AvatarGroup>
                    )}
                  </>
                  <span className="text-xs font-medium text-muted-foreground">
                    {t.members.length} Member{t.members.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CreateTeamForm({ organizationId }: { organizationId: string }) {
  const toastCallbacks = createToastCallbacks({
    loading: "Création de la team en cours...",
  });
  const [state, action, pending] = useActionState(
    withCallbacks(createTeam, {
      ...toastCallbacks,
      onSuccess(result) {
        toastCallbacks.onSuccess?.(result);
      },
    }),
    null,
  );
  return (
    <form className="overflow-y-auto" id="teamForm" action={action}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <input type="hidden" name="organizationId" value={organizationId} />
          <div className="col-span-6">
            <Label htmlFor="name" className="block text-sm font-medium">
              Name
            </Label>
            <Input
              name="name"
              className="my-2 w-full"
              type="text"
              placeholder="My Team Name..."
            />
            <ErrorMessages errors={state?.errorMessage?.name ?? null} />
          </div>
          <div className="col-span-6">
            <Label htmlFor="description" className="block text-sm font-medium">
              Description
            </Label>
            <Textarea
              name="description"
              className="my-2 w-full"
              placeholder="Description facultative..."
            />
            <ErrorMessages errors={state?.errorMessage?.description ?? null} />
          </div>
        </div>
        <DialogFooter className="mt-6 col-span-6 gap-x-6">
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button
            type="submit"
            form="teamForm"
            variant="default"
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Créer"
            )}
          </Button>
        </DialogFooter>
      </div>
    </form>
  );
}
