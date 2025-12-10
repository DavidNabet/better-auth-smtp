import LoadingIcon from "@/app/_components/LoadingIcon";
import Wrapper from "@/app/_components/Wrapper";
import DeleteUser from "@/components/DeleteUser";
import EnableTwoFactor from "@/components/EnableTwoFactor";
import UserPasswordForm from "@/components/UserPasswordForm";
import { Suspense } from "react";
import { Key, Shield } from "lucide-react";
import { CardButton } from "@/app/_components/Card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DetailsPage() {
  return (
    <Wrapper
      title="Security"
      description="Manage your account security and authentication"
    >
      <Suspense fallback={<LoadingIcon />}>
        <div className="grid md:grid-cols-2 gap-4 my-4">
          <CardButton
            title="Password"
            boxed
            icon={<Key />}
            className="border p-4 rounded-lg gap-4 border-accent-foreground/20"
          >
            <UserPasswordForm />
          </CardButton>
          <CardButton
            title="Two Factor Authentification"
            boxed
            icon={<Shield />}
            className="border p-4 rounded-lg gap-4 border-accent-foreground/20"
          >
            <EnableTwoFactor />
          </CardButton>
        </div>
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
    </Wrapper>
  );
}
