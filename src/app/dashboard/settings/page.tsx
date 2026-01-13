import { CardButton } from "@/app/_components/Card";
import LoadingIcon from "@/app/_components/LoadingIcon";
import Wrapper from "@/app/_components/Wrapper";
import { User, Lock } from "lucide-react";
import { Suspense } from "react";
import Header from "./_components/header";
import TabbedUserProfile from "./_components/tabs";
import { auth, Session } from "@/lib/auth";
import { headers } from "next/headers";

export default async function SettingsPage() {
  const [session, activeSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),

    auth.api.listSessions({
      headers: await headers(),
    }),
  ]);
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px]">
      <div className="mx-auto max-w-4xl">
        <Suspense fallback={<LoadingIcon />}>
          <Header session={session as Session} />
          <TabbedUserProfile
            session={session as Session}
            activeSessions={activeSessions}
          />
        </Suspense>
      </div>
    </div>
  );
}
