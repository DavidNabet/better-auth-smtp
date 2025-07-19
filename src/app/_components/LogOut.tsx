"use client";

import { useAuth } from "@/hooks/use-auth";
import { useTransition } from "react";
import { authClient } from "@/lib/auth/auth.client";
import { useRouter } from "next/navigation";
import { SubmitButton } from "./SubmitButton";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function LogOut({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onError(ctx) {
            console.log("error", ctx.error.message);
          },
          onRequest(ctx) {
            console.log("request", ctx);
          },
          onResponse(context) {
            console.log("response", context);
          },
          onSuccess() {
            console.log("log out successfully");
            router.push("/auth/signin");
            router.refresh();
            // redirect("/auth/signin");
          },
        },
      });
    });
  };

  return (
    <form
      method="POST"
      className={cn(className, { disabled: isPending && "cursor-not-allowed" })}
      onSubmit={handleSubmit}
    >
      {children}
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <input
        type="submit"
        className="cursor-pointer"
        value="Logout"
        disabled={isPending}
      />
    </form>
  );
}
