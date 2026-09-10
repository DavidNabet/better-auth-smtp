"use client";

import {
  useEffect,
  useState,
  createContext,
  ReactNode,
  useContext,
} from "react";
import { authClient } from "@/lib/auth/auth.client";
import { useRouter } from "next/navigation";
// import { Session } from "@/lib/auth";
import { APIError } from "better-auth/api";
import {
  hasClientPermission,
  RoleType,
} from "@/lib/permissions/permissions.utils";
import { Role } from "@prisma/client";
import { auth, Member } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { clientQueryOptions } from "@/lib/query/options";

type SessionServer = typeof auth.$Infer.Session & {
  member: Member;
};

type SessionUser = {
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  image?: string;
  token: string;
  expiresAt: Date;
  activeOrgId?: string;
  isRoleOrg?: string;
};

interface AuthContextType {
  session?: SessionUser;
  logOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function useAuthState() {
  const router = useRouter();

  const {
    data: result,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: clientQueryOptions.session().queryKey,
    queryFn: () => {
      const { data, error } = authClient.useSession();
      if (error) throw error;
      return data;
    },
  });

  // verify if user has member role
  /*useEffect(() => {
    let mounted = true;
    if (!s?.activeOrgId) return;
    (async () => {
      try {
        if (!mounted) return;
        await verifyUserInOrganization();
      } catch (error) {
        console.error(
          "Erreur lors de la verification du role isRoleOrg ",
          error,
        );
      }
    })();

    return () => {
      mounted = false;
    };
  }, [s?.activeOrgId]);*/

  async function logOut() {
    if (!result?.session.token) return;
    await authClient.revokeSession({ token: result.session.token });
    refetch(); // invalider et refetch
  }

  /**
   * Vérifie le rôle actif de l'utilisateur dans l'organisation courante.
   * Si une organisation est présente dans la session et qu'un rôle est retourné
   * par l'API, met à jour la session uniquement si le rôle diffère de celui
   * déjà stocké (évite des mises à jour inutiles).
   */
  // async function verifyUserInOrganization() {
  //   if (!s?.isRoleOrg) return;
  //   const { data, error } = await authClient.organization.getActiveMemberRole();
  //   if (error || !data) return false;
  //   console.log("verifyRole: ", data);

  //   const newRole = data.role;

  //   setSession({
  //     ...s,
  //     isRoleOrg: newRole,
  //   });
  // }

  return {
    session: result as SessionUser | undefined,
    isLoading,
    error,
    logOut,
    verifySession: refetch,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthState();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return auth;
}
