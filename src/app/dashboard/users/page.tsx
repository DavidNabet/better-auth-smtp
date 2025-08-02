import { Suspense } from "react";
import Wrapper from "@/app/_components/Wrapper";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { CardInner } from "@/app/_components/Card";
import SetRole from "@/components/SetRole";
import { getCurrentServerSession } from "@/lib/session/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getNotAdminUsers } from "@/lib/user/user.utils";
import { DataTable } from "@/components/Table/DataTable";
import { usersColumns } from "@/components/Table/column";

export default async function AdminPage() {
  const users = await getNotAdminUsers();
  return (
    <Wrapper title="Admin Permissions">
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
              <DataTable
                columns={usersColumns}
                data={users!}
                id="usersColumns"
              />
            </div>
          </Suspense>
        </div>
      </div>
    </Wrapper>
  );
}
