import { Suspense } from "react";
import Wrapper from "@/app/_components/Wrapper";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { CardInner } from "@/app/_components/Card";
import SetRole from "@/components/SetRole";
// import { getCurrentServerSession } from "@/lib/session/server";
// import { getCurrentClientSession } from "@/lib/session/client";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { getNotAdminUsers } from "@/lib/user/user.utils";
import { DataTable } from "@/components/Table/DataTable";
import { usersColumns } from "@/components/Table/column";
import { capitalize } from "@/lib/utils";

export const dynamicParams = true;
export async function generateStaticParams() {
  return [{ role: "admin" }, { role: "moderator" }];
}

export default async function UserRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const users = await getNotAdminUsers();
  const { role } = await params;
  return (
    <Wrapper title={`${capitalize(role)} Permissions`}>
      <div className="flex items-stretch justify-between gap-4 mt-5">
        <div className="col-span-6 sm:col-span-8 flex-1">
          <Suspense fallback={<LoadingIcon />}>
            <div className="space-y-4">
              <div className="container flex flex-col gap-2">
                <h3 className="text-primary leading-tight tracking-tight max-w-xl text-xl font-semibold">
                  All Users
                </h3>
                <p className="text-muted-foreground text-base text-balance">
                  Manage all users
                </p>
              </div>
              {role === "admin" ? (
                <DataTable
                  columns={usersColumns}
                  data={users!}
                  id="adminColumns"
                />
              ) : (
                <DataTable
                  columns={usersColumns}
                  data={users!}
                  id="moderatorColumns"
                />
              )}
            </div>
          </Suspense>
        </div>
      </div>
    </Wrapper>
  );
}
