import { OrganizationSwitcher } from "@/components/organizations/OrganizationSwitcher";
import { getOrganizations } from "@/lib/organization/organization.utils";
import { ReactNode } from "react";

export default function OrganizationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>
      <header className="relative top-0 right-0 flex w-full items-center justify-between p-4">
        <Switcher />
      </header>
      {children}
    </div>
  );
}

async function Switcher() {
  const organizations = await getOrganizations();
  return <OrganizationSwitcher organizations={organizations} />;
}
