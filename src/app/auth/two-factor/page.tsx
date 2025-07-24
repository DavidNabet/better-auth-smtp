import { Suspense } from "react";
import LoadingIcon from "@/app/_components/LoadingIcon";
import AuthTwoFactor from "@/components/AuthTwoFactor";

export default function TwoFactorPage() {
  return (
    <section className="min-h-screen grid place-items-center dark:bg-background">
      <Suspense fallback={<LoadingIcon />}>
        <AuthTwoFactor />
      </Suspense>
    </section>
  );
}
