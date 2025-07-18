"use client";

import Link from "next/link";
import { ChangeEvent, useActionState } from "react";
import { SubmitButton } from "@/app/_components/SubmitButton";
import Alert from "@/app/_components/Alert";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import { signIn } from "@/lib/auth/auth.actions";
import { ZodIssue } from "zod";

export default function LoginForm() {
  const [formState, formAction] = useActionState(signIn, {
    message: {
      error: "",
      success: "",
    },
    errors: [] as ZodIssue[],
    errorMessage: {},
  });

  return (
    <form
      action={formAction}
      id="login-form"
      className="mt-8 grid grid-cols-6 gap-6"
    >
      {
        <>
          <div className="col-span-6">
            <label
              htmlFor="Email"
              className="block text-sm font-medium text-gray-700"
            >
              {" "}
              Email{" "}
            </label>

            <input
              type="email"
              id="Email"
              name="email"
              placeholder="john@example.com"
              className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
            />
            <ErrorMessages errors={formState.errorMessage?.email} />
          </div>

          <div className="col-span-6">
            <label
              htmlFor="Password"
              className="block text-sm font-medium text-gray-700"
            >
              {" "}
              Password{" "}
            </label>

            <input
              type="password"
              id="Password"
              placeholder="••••••••"
              name="password"
              className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
            />
            <ErrorMessages errors={formState.errorMessage?.password} />

            <div className="mt-2 text-sm text-gray-600">
              <Link className="underline" href="/forgot-password">
                Forgot your password?
              </Link>
            </div>
          </div>
        </>
      }

      <div className="col-span-6">
        {formState.message.error && (
          <Alert message={formState?.message.error!} status="error" />
        )}
        {formState?.message?.success && (
          <Alert message={formState.message.success!} status="success" />
        )}
      </div>

      <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
        <SubmitButton loading="Logging In..." label="Sign In" />

        <div className="text-sm text-gray-500">
          <p>You don't have an account?</p>
          <Link href="/auth/signup" className="text-gray-700 underline">
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  );
}
