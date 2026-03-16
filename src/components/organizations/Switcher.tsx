import { getOrganizations } from "@/lib/organization/organization.utils";
import { OrganizationSwitcher } from "./OrganizationSwitcher";

export async function Switcher() {
  const organizations = getOrganizations();
  return <OrganizationSwitcher organizations={organizations} />;
}
