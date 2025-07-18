"use client";

import { ChangeEvent, useState, useTransition } from "react";
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

export default function EnableTwoFactor() {
  const { data } = authClient.useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<PasswordSchema>({
    password: "",
  });
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState<any>({
    password: "",
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
      const { fieldErrors } = validateFields.error.flatten();
      setErrorMessage({
        password: fieldErrors.password?.[0] ?? "",
      });
      return;
    }
    startTransition(async () => {
      if (data?.user.twoFactorEnabled === false) {
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
      if (data?.user.twoFactorEnabled === true) {
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
        <ErrorMessages error={errorMessage?.password} />
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
      <div className="mt-6 col-span-6 sm:flex sm:items-center sm:justify-end gap-x-6">
        <input
          type="submit"
          className={cn(
            "rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
            isPending && "cursor-not-allowed bg-gray-500"
          )}
          disabled={isPending}
          value="Update"
        />
      </div>
    </form>
  );
}
