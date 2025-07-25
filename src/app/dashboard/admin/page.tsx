import { Suspense } from "react";
import Wrapper from "@/app/_components/Wrapper";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { CardInner } from "@/app/_components/Card";
import SetRole from "@/components/SetRole";
import { getCurrentServerSession } from "@/lib/session/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <Wrapper title="Admin Permissions">
      <div className="grid grid-cols-1 sm:-grid-cols-2 w-full gap-4">
        <Suspense fallback={<LoadingIcon />}>
          <CardInner
            title="Set Role"
            description="Switch role from user to member"
            boxed
          >
            <SetRole session={session} />
          </CardInner>
        </Suspense>
      </div>
    </Wrapper>
  );
}
