// import { auth } from "@/lib/auth";
import LoadingIcon from "@/app/_components/LoadingIcon";
// import { unstable_noStore as noStore } from "next/cache";
import Wrapper from "@/app/_components/Wrapper";
import { Suspense } from "react";
import { CardInner } from "@/app/_components/Card";
import { UsersTable } from "@/components/Table/UsersTable";
import { GenerateUsers } from "@/components/GenerateUsers";
// import { redirect } from "next/navigation";
// import { useAuthState } from "@/hooks/use-auth";
import { getCurrentServerSession } from "@/lib/session/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Dashboard() {
  const { userEmail, userName, userRole, userId } =
    await getCurrentServerSession();

  return (
    <Wrapper title={`Welcome ${userName}`}>
      <p>Content</p>
      <span>
        {userEmail
          ? userEmail.replace(/^[^@]+/, "*".repeat(userEmail.indexOf("@")))
          : null}
      </span>
      <div className="flex items-stretch justify-between gap-2">
        {userRole === "ADMIN" ? (
          <div className="col-span-6 sm:col-span-4">
            <Suspense fallback={<LoadingIcon />}>
              <CardInner
                title="Créer des utilisateurs ?"
                description="Générer des utlisateurs"
                boxed
              >
                <GenerateUsers userId={userId.slice(2, 6)} />
              </CardInner>
            </Suspense>
          </div>
        ) : userRole !== "USER" ? (
          <div className="col-span-6 sm:col-span-8 flex-1">
            <Suspense fallback={<LoadingIcon />}>
              <CardInner
                title="Nombre de users"
                description="Nombre de users inscrits"
                className="w-full!"
                actions={
                  <>
                    <Link
                      href={`/dashboard/users/${userRole.toLowerCase()}`}
                      className="text-primary text-sm underline"
                    >
                      Voir plus
                    </Link>
                  </>
                }
              >
                <UsersTable />
              </CardInner>
            </Suspense>
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
}
