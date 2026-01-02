import { ReactNode } from "react";
import { ActionContext, hasActionPermission } from "../action-permissions";
import { useAuth } from "@/hooks/use-auth";
import { Role } from "@prisma/client";
import { RoleType } from "@/lib/permissions/permissions.utils";
import { AnyStatement } from "@/lib/rbac/permissions";

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

  const sessionRole = session?.role as RoleType;

  const actionContext: ActionContext = {
    currentUserId: session?.userId,
    userRole: sessionRole,
    resourceOwnerId: resourceOwnerId,
  };

  const canPerformAction = hasActionPermission(
    sessionRole,
    action,
    actionContext
  );

  return canPerformAction ? <>{children}</> : <>{fallback}</>;
}

export function useActions() {
  const { session } = useAuth();

  const canPerform = (
    action: AnyStatement,
    context?: Partial<ActionContext>
  ): boolean => {
    if (!session) return false;

    const sessionRole = session?.role as RoleType;

    const actionContext: ActionContext = {
      currentUserId: session.userId,
      userRole: sessionRole,
      ...context,
    };

    return hasActionPermission(sessionRole, action, actionContext);
  };

  return { canPerform };
}
