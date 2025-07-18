"use client";

import { useActionState } from "react";
import Alert from "@/app/_components/Alert";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import { SubmitButton } from "@/app/_components/SubmitButton";
import { signUp } from "@/lib/auth/auth.actions";
import { ZodIssue } from "zod";

export default function RegisterForm() {
  const [formState, formAction] = useActionState(signUp, {
    message: {
      success: "",
      error: "",
    },
    errorMessage: {},
    errors: [] as ZodIssue[],
  });

  return (
    <form
      action={formAction}
      id="register-form"
      className="mt-8 grid grid-cols-6 gap-6"
    >
      <div className="col-span-6">
        <label
          htmlFor="Username"
          className="block text-sm font-medium text-gray-700"
        >
          Username
        </label>

        <input
          type="text"
          id="Username"
          name="name"
          placeholder="John Doe"
          className={`mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm ${
            formState.errorMessage?.name ? "border-red-500" : ""
          }`}
        />
        <ErrorMessages errors={formState.errorMessage?.name} />
      </div>

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
          placeholder="john@doe.com"
          className={`mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm ${
            formState.errorMessage?.email ? "border-red-500" : ""
          }`}
        />
        <ErrorMessages errors={formState.errorMessage?.email} />
      </div>

      <div className="col-span-6 sm:col-span-3">
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
          name="password"
          placeholder="••••••••"
          className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
        />
        <ErrorMessages errors={formState.errorMessage?.password} />
      </div>

      <div className="col-span-6 sm:col-span-3">
        <label
          htmlFor="passwordConfirm"
          className="block text-sm font-medium text-gray-700"
        >
          Password Confirmation
        </label>

        <input
          type="password"
          id="passwordConfirm"
          name="passwordConfirm"
          placeholder="••••••••"
          className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
        />
        <ErrorMessages errors={formState.errorMessage?.passwordConfirm} />
      </div>

      <div className="col-span-6">
        <p className="text-sm text-gray-500">
          By creating an account, you agree to our
          <a href="#" className="text-gray-700 underline">
            {" "}
            terms and conditions
          </a>{" "}
          and{" "}
          <a href="#" className="text-gray-700 underline">
            privacy policy
          </a>
          .
        </p>
      </div>

      <div className="col-span-6">
        {formState.errors && (
          <Alert message={formState.message?.error!} status="error" />
        )}
        {formState.message?.success && (
          <Alert message={formState.message.success!} status="success" />
        )}
      </div>

      <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
        <SubmitButton label="Create an account" loading="Creating..." />
        <p className="mt-4 text-sm text-gray-500 sm:mt-0">
          Already have an account ?{" "}
          <a href="/auth/signin" className="text-gray-700 underline">
            Log in
          </a>
          .
        </p>
      </div>
    </form>
  );
}
