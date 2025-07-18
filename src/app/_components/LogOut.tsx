"use client";

import { useAuth } from "@/hooks/use-auth";
// import { authClient, authServer } from "@/lib/auth/auth.client";
import { useRouter } from "next/navigation";

export function LogOut({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { logOut, session } = useAuth();
  const router = useRouter();
  async function handleOnLogout() {
    try {
      await logOut();

      router.push("/auth/signin");
    } catch (error) {
      console.log("logout error: ", error);
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleOnLogout}
      // onClick={async () =>
      //   await authServer.signOut({
      //     fetchOptions: {
      //       onError(ctx) {
      //         console.log("error", ctx.error.message);
      //       },
      //       onRequest(ctx) {
      //         console.log("request", ctx);
      //       },
      //       onResponse(context) {
      //         console.log("response", context);
      //       },
      //       onSuccess() {
      //         console.log("log out successfully");
      //         router.push("/auth/signin");
      //         router.refresh();
      //         // redirect("/auth/signin");
      //       },
      //     },
      //   })
      // }
    >
      {children}
    </button>
  );
}
