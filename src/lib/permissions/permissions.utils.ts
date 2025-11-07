import { authClient } from "../auth/auth.client";
import { Entities, PermissionFor } from "./permissions.types";
import { Role } from "@prisma/client";

// client
export const hasClientPermission = <
  E extends Entities,
  P extends PermissionFor<E>,
>(
  role: keyof typeof Role,
  entity: E,
  permission: P
) => {
  return authClient.admin.checkRolePermission({
    permissions: { [entity]: [permission] },
    role: role!,
  });
};
