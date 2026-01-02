import { RoleType } from "../permissions/permissions.utils";
import { AnyStatement, ROLE_PERMISSIONS } from "./permissions";
import { Role } from "@prisma/client";

export interface ActionContext {
  resourceOwnerId?: string;
  currentUserId: string;
  userRole: Role;
  activeOrganizationId?: string;
}

export function hasActionPermission(
  userRole: Role,
  action: AnyStatement,
  context?: ActionContext
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];

  if (!rolePermissions.includes(action)) {
    return false;
  }

  if (userRole === Role.SUPER_ADMIN && context) {
    if ("delete-comment".includes(action)) {
      return context.resourceOwnerId === context.currentUserId;
    }
  }

  if (userRole === Role.OWNER && context) {
    if ("apps-create".includes(action)) {
      return context.activeOrganizationId === context.currentUserId;
    }
  }

  return true;
}
