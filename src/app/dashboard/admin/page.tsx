import { Suspense } from "react";
import Wrapper from "@/app/_components/Wrapper";
import LoadingIcon from "@/app/_components/LoadingIcon";
import { CardInner } from "@/app/_components/Card";
import UsersTable from "@/components/UsersTable";

export default function AdminPage() {
  return (
    <Wrapper title="Admin Permissions">
      <div className="grid grid-cols-1 w-full gap-4">
        <Suspense fallback={<LoadingIcon />}>
          <CardInner
            title="Set Role"
            description="Switch role from user to member"
          >
            <UsersTable />
          </CardInner>
        </Suspense>
      </div>
    </Wrapper>
  );
}
