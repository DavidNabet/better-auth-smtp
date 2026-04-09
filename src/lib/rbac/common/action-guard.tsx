import { ReactNode } from "react";
import { ActionContext, hasActionPermission } from "../action-permissions";
import { useAuth } from "@/hooks/use-auth";
import { Role } from "@prisma/client";
import { RoleType } from "@/lib/permissions/permissions.utils";
import { AnyStatement } from "@/lib/rbac/permissions";
import { getCurrentUser } from "@/lib/user/user.utils";

interface ActionGuardProps {
  action: AnyStatement;
  children: ReactNode;
  fallback?: ReactNode;
  resourceOwnerId?: string;
}

type MinimalSession = {
  id: string;
  role: Uppercase<RoleType>;
};

export function ActionGuard({
  action,
  children,
  fallback = null,
  resourceOwnerId,
}: ActionGuardProps) {
  const { session } = useAuth();

  if (!session) return <>{fallback}</>;

  const sessionRole = session?.role as Uppercase<RoleType>;

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

// TODO: Il faut créer un autre hasActionPermission pour les roles d'organization spécifique
function createCanPerform(session: MinimalSession | null) {
  return (action: AnyStatement, context?: Partial<ActionContext>): boolean => {
    // Si pas de session, l'utilisateur ne peut effectuer aucune action
    if (!session) return false;

    const sessionRole = session.role;

    // Construit le contexte d'action en fusionnant les infos de session
    // avec un éventuel contexte spécifique passé à l'appel.
    const actionContext: ActionContext = {
      currentUserId: session.id,
      userRole: sessionRole,
      ...context,
    };

    return hasActionPermission(sessionRole, action, actionContext);
  };
}
export function useActions() {
  const { session } = useAuth();

  const minimalSession: MinimalSession | null = session
    ? {
        id: session.userId,
        role: session.role as Uppercase<RoleType>,
        // session.isRoleOrg as Uppercase<RoleType>
      }
    : null;

  const canPerform = createCanPerform(minimalSession);

  return { canPerform };
}
export async function useActionsServer() {
  const { currentUser: session } = await getCurrentUser();

  const minimalSession: MinimalSession | null = session
    ? {
        id: session.id,
        role: session.role as Uppercase<RoleType>,
      }
    : null;

  const canPerform = createCanPerform(minimalSession);

  return { canPerform };
}
