"use client";

import { useActionState, useState } from "react";
import { App, Organization } from "@prisma/client";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import AvatarUpload, { AvatarContext } from "@/components/AvatarUpload";
import {
  createToastCallbacks,
  withCallbacks,
} from "@/app/_components/ServerActionToast";
import { createApp } from "@/lib/app/app.actions";
import { CreateAppSchema } from "@/lib/app/app.schema";

type CreateAppFormProps = {
  organizations: Organization[];
};
export function CreateAppForm({ organizations }: CreateAppFormProps) {
  const [logo, setLogo] = useState<CreateAppSchema["logo"]>(undefined);
  const toastCallbacks = createToastCallbacks({
    loading: "Envoi du commentaire...",
  });
  const [state, action, pending] = useActionState(
    withCallbacks(createApp, {
      ...toastCallbacks,
      onSuccess(result) {
        toastCallbacks.onSuccess?.(result);
      },
    }),
    null
  );

  return (
    <form className="overflow-y-auto" id="createAppForm" action={action}>
      <div className="h-32">
        <div className="relative size-full overflow-hidden">
          <Image
            width={512}
            height={96}
            src="https://images.unsplash.com/photo-1698044048234-2e7f6c4e6aca?q=80&amp;w=1000&amp;auto=format"
            priority
            alt="Pattern bg"
            className="bg-muted size-full rounded-lg border border-transparent object-cover object-center"
          />
        </div>
      </div>
      <div className="-mt-10 px-6">
        <AvatarUpload
          ctx={{ avatarSize: "size-20!" }}
          value={logo}
          onChange={(e) => setLogo(e)}
        />
      </div>
      <div className="px-6 pt-4 pb-6 space-y-4">
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-6 sm:col-span-3">
            <Label htmlFor="name" className="block text-sm font-medium">
              App name
            </Label>
            <Input
              name="name"
              className="my-2 w-full"
              type="text"
              placeholder="Duolingo"
            />
            <ErrorMessages errors={state?.errorMessage?.name ?? null} />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Label htmlFor="slug" className="block text-sm font-medium">
              App slug
            </Label>
            <Input
              name="slug"
              className="my-2 w-full"
              type="text"
              placeholder="my-app"
            />
            <ErrorMessages errors={state?.errorMessage?.slug ?? null} />
          </div>
          <div className="col-span-6">
            <Label htmlFor="description" className="block text-sm font-medium">
              Description
            </Label>
            <Textarea
              name="description"
              id="description"
              className="my-2 w-full"
              placeholder="my-app"
            />
            <ErrorMessages errors={state?.errorMessage?.description ?? null} />
          </div>
          <div className="col-span-6">
            <Label htmlFor="organization" className="block text-sm font-medium">
              Associate your team
            </Label>
            <Select name="organizationId">
              <SelectTrigger id="organization" className="mt-1 w-full">
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(organizations) &&
                  organizations?.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <ErrorMessages
              errors={state?.errorMessage?.organizationId ?? null}
            />
          </div>
          <DialogFooter className="mt-6 col-span-6 gap-x-6">
            <Button
              type="submit"
              form="createAppForm"
              variant="default"
              disabled={pending}
            >
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sync your app
            </Button>
          </DialogFooter>
        </div>
      </div>
    </form>
  );
}
