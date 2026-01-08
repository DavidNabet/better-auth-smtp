import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Shield, Lock, User, Key } from "lucide-react";
import UserProfileForm from "@/components/UserProfileForm";
import { auth, Session } from "@/lib/auth";
import { headers } from "next/headers";
import { CardButton } from "@/app/_components/Card";
import LoadingIcon from "@/app/_components/LoadingIcon";
import UserPasswordForm from "@/components/UserPasswordForm";
import EnableTwoFactor from "@/components/EnableTwoFactor";
import { ActiveSessions } from "./activeSessions";
import DeleteUser from "@/components/DeleteUser";

export default async function TabbedUserProfile() {
  const [session, activeSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),

    auth.api.listSessions({
      headers: await headers(),
    }),
  ]);
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="h-auto w-full justify-start gap-6 bg-transparent p-0">
        <TabsTrigger
          value="profile"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <User className="mr-2 size-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger
          value="security"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Lock className="mr-2 size-4" />
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <Card className="px-3">
          <CardHeader>
            <CardTitle className="font-semibold text-xl tracking-tight">
              Profile
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Change your name and your photo
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <UserProfileForm session={session as Session} />
          </CardContent>
        </Card>
        <Card className="px-3">
          <CardContent className="px-6">
            <h2 className="mb-4 text-lg font-semibold">Data Management</h2>
            <DeleteUser />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="security" className="space-y-6">
        <Card className="px-3">
          <CardHeader>
            <CardTitle className="font-semibold text-xl tracking-tight">
              Security
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Manage your account security and authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <Suspense fallback={<LoadingIcon />}>
              <div className="grid md:grid-cols-2 gap-4 my-2">
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
          </CardContent>
        </Card>
        <Card className="px-3">
          <CardContent className="px-6">
            <ActiveSessions data={session} activeSessions={activeSessions} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
