"use client";

import { ChangeEvent, useState, useTransition } from "react";
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
import { useRouter } from "next/navigation";
import Alert from "@/app/_components/Alert";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import {
  passwordSchema,
  PasswordSchema,
  PasswordSchemaErrors,
} from "@/lib/auth/auth.schema";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth/auth.client";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { z } from "zod";
import { Button } from "./ui/button";
import { Loader2, Shield } from "lucide-react";
import { FieldErrors } from "@/lib/feedback/feedback.types";

export default function EnableTwoFactor() {
  const { data } = authClient.useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<PasswordSchema>({
    password: "",
  });
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState<
    FieldErrors<typeof passwordSchema>
  >({
    password: [""],
  });

  if (data?.user.twoFactorEnabled === null) {
    return;
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validateFields = passwordSchema.safeParse(formData);
    if (!validateFields.success) {
      const { fieldErrors } = z.flattenError(validateFields.error);
      setErrorMessage({
        password: fieldErrors.password ?? [""],
      });
      return;
    }
    startTransition(async () => {
      if (!data?.user.twoFactorEnabled) {
        await authClient.twoFactor.enable({
          password: formData.password,
          fetchOptions: {
            onError: (ctx) => {
              setError(ctx.error.message);
            },
            onResponse() {
              console.log("loading enabled");
            },
            onRequest: () => {
              console.log("onRequest enabled");
              setSuccess("");
              setError("");
            },
            onSuccess: () => {
              setSuccess("2FA enabled");
              setTimeout(() => {
                setSuccess("");
                setError("");
                setFormData({ password: "" });
              }, 1000);
            },
          },
        });
      }
      if (data?.user.twoFactorEnabled) {
        await authClient.twoFactor.disable({
          password: formData.password,
          fetchOptions: {
            onError: (ctx) => {
              setError(ctx.error.message);
            },
            onResponse() {
              console.log("loading disabled");
            },
            onRequest: () => {
              console.log("onRequest disabled");
              setSuccess("");
              setError("");
            },
            onSuccess: () => {
              setSuccess("2FA disabled");
              setTimeout(() => {
                setSuccess("");
                setError("");
                setFormData({ password: "" });
              }, 1000);
            },
          },
        });
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" type="button" variant="default">
          <div className="flex items-center gap-2">
            <Shield className="size-4" />
            <span>{data?.user.twoFactorEnabled ? "Disable" : "Enable"}</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Two-factor authentication</DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>
        <form className="mt-8 grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
          <div className="col-span-6">
            <Label htmlFor="Password" className="block text-sm font-medium">
              Password
            </Label>

            <Input
              type="password"
              id="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="mt-1 w-full"
            />
            <ErrorMessages errors={errorMessage?.password} />
          </div>
          <div className="col-span-full sm:col-span-3">
            <Label htmlFor="AcceptConditions">Activer le 2FA ?</Label>
          </div>
          <div className="col-span-full sm:col-span-3">
            <Switch
              id="AcceptConditions"
              defaultChecked={data?.user.twoFactorEnabled}
              onCheckedChange={(e) => !e}
            />
          </div>
          <div className="col-span-6">
            {error && <Alert message={error!} status="error" />}
            {success && <Alert message={success!} status="success" />}
          </div>
          <div className="mt-6 col-span-6 gap-x-6">
            <DialogFooter>
              <Button
                type="submit"
                className={cn(
                  "bg-emerald-600 shadow-xs hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 cursor-pointer text-white",
                  isPending && "cursor-not-allowed bg-metal",
                )}
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                Update
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
