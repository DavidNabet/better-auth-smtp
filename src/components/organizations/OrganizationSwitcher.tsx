"use client";

import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { authClient } from "@/lib/auth/auth.client";
import type { Organization } from "@prisma/client";

type OrganizationSwitcherProps = {
  organizations: Organization[];
};

export function OrganizationSwitcher({
  organizations,
}: OrganizationSwitcherProps) {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const handleChangeOrganization = async (orgId: string) => {
    try {
      const { error } = await authClient.organization.setActive({
        organizationId: orgId,
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
      value={activeOrganization?.id}
      onValueChange={handleChangeOrganization}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
