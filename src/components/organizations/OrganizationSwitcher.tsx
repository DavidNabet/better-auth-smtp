"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { authClient } from "@/lib/auth/auth.client";
import { getOrganizations } from "@/lib/organization/organization.utils";
import { use } from "react";

type OrganizationSwitcherProps = {
  organizations: ReturnType<typeof getOrganizations>;
};

export function OrganizationSwitcher({
  organizations,
}: OrganizationSwitcherProps) {
  const orgs = use(organizations);
  const router = useRouter();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const handleChangeOrganization = async (orgSlug: string) => {
    try {
      const { error } = await authClient.organization.setActive({
        organizationSlug: orgSlug,
      });

      if (error) {
        console.error(error);
        toast.error("Failed to switch organization");
        return;
      }
      toast.success("Organization switched successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to active an organization");
    }
  };

  return (
    <Select
      value={activeOrganization?.slug}
      onValueChange={(val) => {
        (handleChangeOrganization(val),
          router.push(`/dashboard/organizations/${val}`));
      }}
    >
      <SelectTrigger className="w-[180px] selectLink">
        <SelectValue placeholder="Select an organization" />
      </SelectTrigger>
      <SelectContent className="flex flex-col gap-2">
        {orgs.map((org) => (
          <SelectItem key={org.name} value={org?.slug!}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
