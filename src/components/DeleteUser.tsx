"use client";

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { toast } from "sonner";
import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import type { User } from "better-auth";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/auth.client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { passwordSchema, PasswordSchema } from "@/lib/auth/auth.schema";

interface DeleteUserProps {
  user: User | null;
}

export default function DeleteUser() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<PasswordSchema>({
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState<
    z.inferFlattenedErrors<z.ZodTypeAny>["fieldErrors"]
  >({
    password: [""],
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validatedFields = passwordSchema.safeParse(formData);
    if (!validatedFields.success) {
      const { fieldErrors } = validatedFields.error.flatten();
      setErrorMessage({
        password: fieldErrors.password ?? [""],
      });
      return;
    }

    startTransition(async () => {
      await authClient.deleteUser({
        password: formData.password,
        fetchOptions: {
          onError(ctx) {
            if (ctx.error.status === 403) {
              toast.error("Invalid password", { id: "deleteUser" });
            }
            toast.error(ctx.error.message, { id: "deleteUser" });
          },
          onResponse() {
            console.log("loading deleteuser");
            toast.loading("En cours...", { id: "deleteUser" });
          },
          onSuccess() {
            toast.success("Compte supprimé", { id: "deleteUser" });
            router.push("/auth/sign-in");
          },
        },
      });
    });
  }

  return (
    <Dialog>
      <form onSubmit={handleSubmit} id="deleteUser">
        <DialogTrigger asChild>
          <Button variant="destructive" className="focus-within:ring-2">
            Delete Account
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Account Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action is
              irreversible, and all your data will be permanently deleted.
              Please confirm if you wish to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="border-b border-gray-900/10" />
          <div className="grid gap-4">
            <span className="space-y-2 text-sm">
              Please type your password to confirm
            </span>
            <div className="grid gap-3">
              <Label htmlFor="passwordConfirm">Password</Label>
              <Input
                type="password"
                name="passwordConfirm"
                placeholder="mypassword"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 w-full  shadow-sm ${
                  errorMessage?.password ? "border-destructive" : ""
                }`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              variant="secondary"
              form="deleteUser"
              className={cn(
                " shrink-0 transition-colors focus:ring-offset-2 focus:ring-offset-secondary cursor-pointer w-full text-white bg-destructive/90 hover:bg-destructive",
                isPending && "opacity-50 cursor-not-allowed"
              )}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}I
              understand the consequences. Delete my account.
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
