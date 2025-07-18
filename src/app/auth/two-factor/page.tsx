import { Suspense } from "react";
import LoadingIcon from "@/app/_components/LoadingIcon";
import AuthTwoFactor from "@/components/AuthTwoFactor";

export default function TwoFactorPage() {
  return (
    <section className="h-full grid place-items-center bg-[#EAF5F6]">
      <Suspense fallback={<LoadingIcon />}>
        <AuthTwoFactor />
      </Suspense>
    </section>
  );
}
