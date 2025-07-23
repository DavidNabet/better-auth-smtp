import LoadingIcon from "@/app/_components/LoadingIcon";
import Wrapper from "@/app/_components/Wrapper";
import DeleteUser from "@/components/DeleteUser";
import EnableTwoFactor from "@/components/EnableTwoFactor";
import UserPasswordForm from "@/components/UserPasswordForm";
import { Suspense } from "react";
import { CardInner } from "@/app/_components/Card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DetailsPage() {
  return (
    <Wrapper title="Security">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Suspense fallback={<LoadingIcon />}>
          <CardInner
            title="Change your password"
            description="Change your password"
          >
            <UserPasswordForm />
          </CardInner>
        </Suspense>
        <Suspense fallback={<LoadingIcon />}>
          <CardInner
            title="Two-factor authentication"
            description="Enable two-factor authentication"
          >
            <EnableTwoFactor />
          </CardInner>
        </Suspense>
        <Suspense fallback={<LoadingIcon />}>
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle>Delete your account</CardTitle>
              <CardDescription>Permanently delete your account</CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteUser />
            </CardContent>
          </Card>
        </Suspense>
      </div>
    </Wrapper>
  );
}
