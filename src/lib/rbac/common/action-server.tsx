import { ExcludeUser } from "@/lib/permissions/permissions.utils";
import { getCurrentUser } from "@/lib/user/user.utils";
import { AnyStatement } from "../permissions";
import { ActionContext, hasActionPermission } from "../action-permissions";

export type MinimalSession = {
  id: string;
  role: ExcludeUser;
};

// TODO: Il faut créer un autre hasActionPermission pour les roles d'organization spécifique
export function createCanPerform(session: MinimalSession | null) {
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

// TODO: Probablement changer la direction entre User.role et le org/team scope Member.role/TeamMember roles

export async function useActionsServer() {
  const { currentUser: session } = await getCurrentUser();

  const minimalSession: MinimalSession | null = session
    ? {
        id: session.id,
        role: session.role as ExcludeUser,
      }
    : null;

  const canPerform = createCanPerform(minimalSession);

  return { canPerform };
}
