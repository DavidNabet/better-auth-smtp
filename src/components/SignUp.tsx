"use client";
import { ChangeEvent, useState, useTransition } from "react";
import { authClient } from "@/lib/auth/auth.client";
import { SubmitButton } from "@/app/_components/SubmitButton";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import {
  CreateUserErrors,
  CreateUserSchema,
  createUserSchema,
} from "@/lib/auth/auth.schema";
import Link from "next/link";
import { APIError, email } from "better-auth";
import { useRouter } from "next/navigation";
import Alert from "@/app/_components/Alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";

export default function AuthSignUp() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<CreateUserSchema>({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [errorMessage, setErrorMessage] = useState<
    CreateUserErrors["fieldErrors"]
  >({
    name: [""],
    email: [""],
    password: [""],
    passwordConfirm: [""],
  });
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validateFields = createUserSchema.safeParse(formData);
    if (!validateFields.success) {
      const { fieldErrors } = z.flattenError(validateFields.error);
      setErrorMessage({
        name: fieldErrors.name ?? [""],
        email: fieldErrors.email ?? [""],
        password: fieldErrors.password ?? [""],
        passwordConfirm: fieldErrors.passwordConfirm ?? [""],
      });
      return;
    }

    startTransition(async () => {
      await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        fetchOptions: {
          onError(ctx) {
            console.log(ctx.error);
            if (ctx.error.status === 403) {
              setError("Please verify your email address");
            }
            setError(ctx.error.message);
          },
          onRequest() {
            console.log("loading signup");
            setSuccess("");
            setError("");
          },
          onSuccess() {
            console.log("success");
            setSuccess("Verify your email address");
          },
        },
      });
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      id="register-form"
      className="mt-8 grid grid-cols-6 gap-6"
    >
      <div className="col-span-6">
        <Label
          htmlFor="Username"
          className="block text-gray-700 dark:text-muted-foreground"
        >
          Username
        </Label>

        <Input
          type="text"
          id="Username"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          className={`mt-1 w-full  shadow-sm ${
            errorMessage?.name ? "border-destructive" : ""
          }`}
        />
        <ErrorMessages errors={errorMessage?.name} />
      </div>

      <div className="col-span-6">
        <Label
          htmlFor="Email"
          className="block text-gray-700 dark:text-muted-foreground"
        >
          Email
        </Label>

        <Input
          type="email"
          id="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@doe.com"
          className={`mt-1 w-full shadow-sm ${
            errorMessage?.email ? "border-destructive" : ""
          }`}
        />
        <ErrorMessages errors={errorMessage?.email} />
      </div>

      <div className="col-span-6 sm:col-span-3">
        <Label
          htmlFor="Password"
          className="block text-gray-700 dark:text-muted-foreground"
        >
          {" "}
          Password{" "}
        </Label>

        <Input
          type="password"
          id="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="mt-1 w-full shadow-sm "
        />
        <ErrorMessages errors={errorMessage?.password} />
      </div>

      <div className="col-span-6 sm:col-span-3">
        <Label
          htmlFor="passwordConfirm"
          className="block text-gray-700 dark:text-muted-foreground"
        >
          Password Confirmation
        </Label>

        <Input
          type="password"
          id="passwordConfirm"
          name="passwordConfirm"
          value={formData.passwordConfirm}
          onChange={handleChange}
          placeholder="••••••••"
          className="mt-1 w-full shadow-sm"
        />
        <ErrorMessages errors={errorMessage?.passwordConfirm} />
      </div>

      <div className="col-span-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          By creating an account, you agree to our
          <a href="#" className="text-gray-700 dark:text-gray-300 underline">
            {" "}
            terms and conditions
          </a>{" "}
          and{" "}
          <a href="#" className="text-gray-700 dark:text-gray-300 underline">
            privacy policy
          </a>
          .
        </p>
      </div>

      <div className="col-span-6">
        {error && <Alert message={error!} status="error" />}
        {success && <Alert message={success!} status="success" />}
      </div>

      <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
        <Button
          type="submit"
          variant="secondary"
          className={cn(
            "border text-white shrink-0 transition-colors focus:ring-offset-2 focus:ring-offset-secondary cursor-pointer",
          )}
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
          Already have an account ?{" "}
          <Link
            href="/auth/signin"
            className="text-gray-700 dark:text-gray-300 underline"
          >
            Log in
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
