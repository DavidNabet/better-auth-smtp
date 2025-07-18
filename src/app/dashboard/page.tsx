// "use client";

// import { auth } from "@/lib/auth";
// import { LogOut } from "../_components/LogOut";
import { useFormState } from "react-dom";
import LoadingIcon from "@/app/_components/LoadingIcon";
// import { unstable_noStore as noStore } from "next/cache";
import Wrapper from "@/app/_components/Wrapper";
import { getCurrentServerSession } from "@/lib/session/server";
import { Suspense } from "react";
import { CardInner } from "@/app/_components/Card";
import UsersTable from "@/components/UsersTable";
import { GenerateUsers } from "@/components/GenerateUsers";

export default async function Dashboard() {
  const session = await getCurrentServerSession();
  return (
    <Wrapper title={`Welcome ${session?.user?.name}`}>
      <p>Content</p>
      <span>
        {session?.user.email.replace(
          /^[^@]+/,
          "*".repeat(session?.user.email.indexOf("@"))
        )}
      </span>
      {session?.user.role === "ADMIN" && (
        <div className="flex items-stretch justify-between gap-2">
          <div className="col-span-6 sm:col-span-4">
            <Suspense fallback={<LoadingIcon />}>
              <CardInner
                title="Créer des utilisateurs ?"
                description="Générer des utlisateurs"
              >
                <GenerateUsers userId={session?.user.id.slice(2, 6)} />
              </CardInner>
            </Suspense>
          </div>
          <div className="col-span-6 sm:col-span-8 flex-1">
            <Suspense fallback={<LoadingIcon />}>
              <CardInner
                title="Nombre de users"
                description="Nombre de users inscrits"
                className="w-full!"
              >
                <UsersTable />
              </CardInner>
            </Suspense>
          </div>
        </div>
      )}
    </Wrapper>
  );
}
