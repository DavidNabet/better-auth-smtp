"use client";

import { ReactNode } from "react";
import { ActionContext, hasActionPermission } from "../action-permissions";
import { useAuth } from "@/hooks/use-auth";
import { Role } from "@prisma/client";
import { ExcludeUser, RoleType } from "@/lib/permissions/permissions.utils";
import { AnyStatement } from "@/lib/rbac/permissions";
import { getCurrentUser } from "@/lib/user/user.utils";
import { createCanPerform, MinimalSession } from "./action-server";

interface ActionGuardProps {
  action: AnyStatement;
  children: ReactNode;
  fallback?: ReactNode;
  resourceOwnerId?: string;
}

export function ActionGuard({
  action,
  children,
  fallback = null,
  resourceOwnerId,
}: ActionGuardProps) {
  const { session } = useAuth();

  if (!session) return <>{fallback}</>;

  const sessionRole = session?.role as ExcludeUser;

  const actionContext: ActionContext = {
    currentUserId: session?.userId,
    userRole: sessionRole,
    resourceOwnerId: resourceOwnerId,
  };

  const canPerformAction = hasActionPermission(
    sessionRole,
    action,
    actionContext,
  );

  return canPerformAction ? <>{children}</> : <>{fallback}</>;
}

export function useActions() {
  const { session } = useAuth();

  const minimalSession: MinimalSession | null = session
    ? {
        id: session.userId,
        role: session.role as ExcludeUser,
        // session.isRoleOrg as Uppercase<RoleType>
      }
    : null;

  const canPerform = createCanPerform(minimalSession);

  return { canPerform };
}
