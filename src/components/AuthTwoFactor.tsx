"use client";

import { useState, useTransition, FC, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { requestOTP } from "@/lib/auth/auth.service";
import { TwoFactorSchema, twoFactorSchema } from "@/lib/auth/auth.schema";
import Alert from "@/app/_components/Alert";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import Link from "next/link";
import { authClient, authServer } from "@/lib/auth/auth.client";
import { cn } from "@/lib/utils";
import { FieldErrors } from "@/lib/feedback/feedback.types";

const AuthTwoFactor: FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<TwoFactorSchema>({
    code: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState<
    FieldErrors<typeof twoFactorSchema>
  >({
    code: [""],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const response = await requestOTP();
      if (response?.data) {
        setSuccess("OTP has been sent to your email.");
      } else if (response?.error) {
        setError(response.error.message);
      }
    } catch (error) {
      console.error("Error resending OTP: ", error);
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const validateFields = twoFactorSchema.safeParse(formData);
    if (!validateFields.success) {
      const { fieldErrors } = z.flattenError(validateFields.error);
      setErrorMessage({
        code: fieldErrors.code ?? [""],
      });
    }

    try {
      await authClient.twoFactor.verifyOtp({
        code: formData.code,
        fetchOptions: {
          onRequest: () => setIsLoading(true),
          onResponse: () => setIsLoading(false),
          onSuccess: () => {
            setSuccess("OTP validated successfully.");
            router.replace("/dashboard");
          },
          onError: (ctx) => setError(ctx.error.message),
        },
      });
    } catch (error) {
      console.error("Error verifying OTP: ", error);
      setError("Unable to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md bg-card text-card-foreground p-12 rounded-xl shadow-sm border">
      <form onSubmit={handleSubmit}>
        <h3 className="text-2xl font-bold text-card-foreground mb-6">
          OTP Verification
        </h3>
        <>
          <p className="text-muted-foreground text-sm mb-6">
            Enter the OTP you received to your email.
          </p>

          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            onChange={(code) => setFormData({ code })}
            value={formData.code}
            inputMode="numeric"
            disabled={isLoading}
            name="otp"
            style={{ justifyItems: "space-between" }}
            className="w-full grid grid-cols-[repeat(6,1fr)]"
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot
                  className="w-12 leading-[75px] text-[32px] bg-input text-center uppercase text-foreground mb-[25px] rounded-sm border-none focus:outline-hidden"
                  key={i}
                  index={i}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <ErrorMessages errors={errorMessage?.code} />
        </>
        <div className="col-span-6">
          {error && <Alert message={error!} status="error" />}
          {success && <Alert message={success!} status="success" />}
        </div>

        <div className="mt-6 col-span-6 sm:flex sm:items-center sm:justify-between gap-x-6">
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleResendOTP}
            className={cn(
              "dark:bg-primary text-primary-foreground bg-primary shrink-0 transition-colors focus:ring-offset-2 focus:ring-offset-secondary cursor-pointer",
              isLoading && "cursor-not-allowed dark:bg-primary/50",
            )}
          >
            Resend OTP
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "dark:bg-teal-500 bg-teal-600 text-white shrink-0 transition-colors focus:ring-offset-2 focus:ring-offset-secondary cursor-pointer",
              isLoading && "cursor-not-allowed bg-teal-700/50",
            )}
          >
            Verify
          </Button>
          <p className="mt-4 text-sm sm:mt-0">
            <span>Come back ?</span>
            <br />
            <Link href="/auth/signin" className=" underline">
              Log in
            </Link>
            .
          </p>
        </div>
      </form>
    </div>
  );
};

export default AuthTwoFactor;
