import LoadingIcon from "@/app/_components/LoadingIcon";
import UserProfileForm from "@/components/UserProfileForm";
import Wrapper from "@/app/_components/Wrapper";
import { CardInner } from "@/app/_components/Card";
import { Suspense } from "react";
import DeleteUser from "@/components/DeleteUser";
import { auth, Session } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DetailsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <Wrapper title="Details">
      <div className="grid grid-cols-1 gap-4">
        <Suspense fallback={<LoadingIcon />}>
          <CardInner
            title="Profile"
            description="Change your name and photo"
            boxed
          >
            <UserProfileForm session={session as Session} />
          </CardInner>
        </Suspense>
      </div>
    </Wrapper>
  );
}
