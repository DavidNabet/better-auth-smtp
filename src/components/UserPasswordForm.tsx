"use client";

import {
  useState,
  useActionState,
  startTransition,
  ChangeEvent,
  FormEvent,
} from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { updateUserPassword } from "@/lib/user/user.actions";
import { UpdatePasswordSchema } from "@/lib/user/user.schema";
import { ErrorMessages } from "@/app/_components/ErrorMessages";

export default function UserPasswordForm() {
  const [formData, setFormData] = useState<UpdatePasswordSchema>({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
    revokeOtherSessions: false,
  });
  const [
    {
      message: { error, success },
      errorMessage,
    },
    formAction,
    pending,
  ] = useActionState(updateUserPassword, {
    message: {
      error: "",
      success: "",
    },
    errorMessage: {},
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData);
      console.log(data);
      formAction(formData);
      // setFormData({
      //   currentPassword: "",
      //   newPassword: "",
      //   newPasswordConfirm: "",
      //   revokeOtherSessions: true,
      // });
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" type="button" variant="outline">
          Change your password
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Change your password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new on
          </DialogDescription>
        </DialogHeader>
        <form className="mt-8 grid grid-cols-6 gap-6" onSubmit={handleSubmit}>
          <div className="col-span-6">
            <Label
              htmlFor="currentPassword"
              className="block text-sm font-medium"
            >
              Ancien mot de passe
            </Label>

            <Input
              type="password"
              id="currentPassword"
              name="currentPassword"
              placeholder="••••••••"
              className="mt-1 w-full "
              value={formData.currentPassword}
              onChange={handleChange}
            />
            <ErrorMessages errors={errorMessage?.currentPassword} />
          </div>
          <div className="col-span-6">
            <Label htmlFor="newPassword" className="block text-sm font-medium ">
              Nouveau mot de passe
            </Label>

            <Input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="••••••••"
              className="mt-1 w-full"
              value={formData.newPassword}
              onChange={handleChange}
            />
            <ErrorMessages errors={errorMessage?.newPassword} />
          </div>
          <div className="col-span-6">
            <Label
              htmlFor="newPasswordConfirm"
              className="block text-sm font-medium"
            >
              Confirmation du mot de passe
            </Label>

            <Input
              type="password"
              id="newPasswordConfirm"
              placeholder="••••••••"
              value={formData.newPasswordConfirm}
              onChange={handleChange}
              className="mt-1 w-full"
            />
            <ErrorMessages errors={errorMessage?.newPasswordConfirm} />
          </div>
          <div className="col-span-6">
            <Label
              className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
              htmlFor="revokeOtherSessions"
            >
              <Checkbox
                id="revokeOtherSessions"
                name="revokeOtherSessions"
                defaultChecked={formData.revokeOtherSessions}
                onCheckedChange={(e) => !e}
                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
              />
              <div className="grid gap-1.5 font-normal">
                <p className="text-sm leading-none font-medium">
                  Revoke all other sessions.
                </p>
                <p className="text-muted-foreground text-sm">
                  This will sign you out from all other devices and sessions
                  except the current one.
                </p>
              </div>
            </Label>
            <ErrorMessages errors={errorMessage?.revokeOtherSessions} />
          </div>
          <div className="mt-6 col-span-6 gap-x-6">
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                variant="default"
                className={cn(
                  "bg-teal-600 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 cursor-pointer",
                  pending && "cursor-not-allowed bg-metal"
                )}
                disabled={pending}
              >
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
