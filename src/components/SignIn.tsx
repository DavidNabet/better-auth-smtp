"use client";
import { ChangeEvent, useState, useTransition } from "react";
import { authClient } from "@/lib/auth/auth.client";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import { SignInSchema, signInSchema } from "@/lib/auth/auth.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { requestOTP } from "@/lib/auth/auth.service";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function AuthSignIn() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<SignInSchema>({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validateFields = signInSchema.safeParse(formData);
    if (!validateFields.success) {
      const { fieldErrors } = validateFields.error.flatten();
      setErrorMessage({
        email: fieldErrors.email?.[0] ?? "",
        password: fieldErrors.password?.[0] ?? "",
      });
      return;
    }

    startTransition(async () => {
      await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        fetchOptions: {
          onError(ctx) {
            console.log(ctx.error.message);
            if (ctx.error.status !== 403) {
              toast.error(ctx.error.message);
            }
            toast.error("Please verify your email address", {
              id: "signInToast",
            });
          },
          onRequest() {
            console.log("loading signin");
            toast.loading("Signin...", { id: "signInToast" });
          },
          async onSuccess(ctx) {
            console.log("success", ctx);
            if (ctx.data.twoFactorRedirect) {
              console.log("twoFactorRedirect");
              const response = await requestOTP();
              if (response?.data) {
                toast.success("OTP has been sent to your email", {
                  id: "signInToast",
                });
                router.push("/auth/two-factor");
              } else if (response?.error) {
                toast.error(response.error.message, { id: "signInToast" });
              }
            } else {
              toast.success("Successfully sign in", { id: "signInToast" });
              router.push("/dashboard");
            }
          },
        },
      });
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      id="login-form"
      className="mt-8 grid grid-cols-6 gap-6"
    >
      <div className="col-span-6">
        <Label htmlFor="Email" className="block text-primary">
          Email
        </Label>

        <Input
          type="email"
          id="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          className="mt-1 w-full shadow-sm"
        />
      </div>

      <div className="col-span-6">
        <Label htmlFor="Password" className="block text-primary">
          Password
        </Label>

        <Input
          type="password"
          id="Password"
          placeholder="••••••••"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="mt-1 w-full  shadow-sm "
        />
        <ErrorMessages error={errorMessage?.password} />

        <div className="mt-2 text-sm text-gray-600 dark:text-muted-foreground">
          <Link className="underline" href="/forgot-password">
            Forgot your password?
          </Link>
        </div>
      </div>

      <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
        <Button
          type="submit"
          variant="secondary"
          className={cn(
            " shrink-0 transition-colors  focus:ring-offset-2 focus:ring-offset-secondary cursor-pointer",
            isPending && "opacity-50 cursor-not-allowed"
          )}
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>

        <div className="text-sm text-gray-500 dark:text-muted-foreground">
          <p>You don't have an account?</p>
          <Link
            href="/auth/signup"
            className="text-gray-700 dark:text-muted-foreground/60 underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  );
}
