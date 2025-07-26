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
        <div className="col-span-6 sm:col-span-4">
          <Suspense fallback={<LoadingIcon />}>
            <CardInner
              title="Set Role"
              description="Switch role from user to member"
              className="mt-0"
            >
              <SetRole users={users!} />
            </CardInner>
          </Suspense>
        </div>
        <div className="col-span-6 sm:col-span-8 flex-1">
          <Suspense fallback={<LoadingIcon />}>
            <DataTable columns={usersColumns} data={users!} />
          </Suspense>
        </div>
      </div>
    </Wrapper>
  );
}
