import LoadingIcon from "@/app/_components/LoadingIcon";
import UserProfileForm from "@/components/UserProfileForm";
import Wrapper from "@/app/_components/Wrapper";
import { CardInner } from "@/app/_components/Card";
import { Suspense } from "react";
import DeleteUser from "@/components/DeleteUser";

export default function DetailsPage() {
  return (
    <Wrapper title="Details">
      <div className="grid grid-cols-1 gap-4">
        <Suspense fallback={<LoadingIcon />}>
          <CardInner title="Profile" description="Change your name and photo">
            <UserProfileForm />
          </CardInner>
        </Suspense>
      </div>
    </Wrapper>
  );
}
