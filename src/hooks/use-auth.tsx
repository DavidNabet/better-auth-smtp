"use client";

import {
  useEffect,
  useState,
  createContext,
  ReactNode,
  useContext,
  useRef,
} from "react";
import { authClient } from "@/lib/auth/auth.client";
import { useRouter } from "next/navigation";
// import { Session } from "@/lib/auth";
// import {
//   hasClientPermission,
//   RoleType,
// } from "@/lib/permissions/permissions.utils";
import { auth, Member } from "@/lib/auth";

type SessionServer = typeof auth.$Infer.Session & {
  member: Member;
};

function sessionDto(data: SessionServer | null) {
  return {
    sessionId: data?.session.id,
    userId: data?.user.id!,
    email: data?.user.email!,
    name: data?.user.name!,
    role: data?.user.role!,
    image: data?.user.image,
    token: data?.session.token!,
    expiresAt: data?.session.expiresAt!,
    activeOrgId: data?.session.activeOrganizationId,
    isRoleOrg: data?.member?.role ?? 1,
  };
}

type SessionUser = NonNullable<ReturnType<typeof sessionDto>>;

interface AuthContextType {
  session: SessionUser | null;
  logOut: () => void;
  verifySessionInOrganization: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function useAuthState() {
  const [s, setSession] = useState<SessionUser | undefined>(undefined);
  const { data, isPending, error, refetch } = authClient.useSession();

  const isPendingRef = useRef(isPending);
  const router = useRouter();

  useEffect(() => {
    isPendingRef.current = isPending;
  }, [isPending]);

  useEffect(() => {
    if (isPending) {
      const timerNotify = setTimeout(() => {
        if (isPendingRef.current) {
          refetch();
        }
      }, 2500);

      const filteredData = sessionDto(data as SessionServer);
      setSession(filteredData);
      console.log("session provider: ", data);

      const timerReload = setTimeout(() => {
        if (isPendingRef.current) {
          window.location.reload();
        }
      }, 5000);

      return () => {
        clearTimeout(timerNotify);
        clearTimeout(timerReload);
      };
    }
  }, [isPending]);

  // verify if user has member role
  useEffect(() => {
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
  }, [s?.activeOrgId]);
  /*useEffect(() => {
    // Role
    if (!s) return;
    async function run() {
      const permission = hasClientPermission(
        s?.role as Exclude<Role, "OWNER">,
        "user",
        "delete",
      );
      if (!permission) {
        throw new APIError("BAD_REQUEST", {
          message: "You don't actually have the correct role",
        });
      }
      setIsAdmin(permission);
    }
    if (s.role === Role.SUPER_ADMIN) {
      run();
    }
  }, [s?.sessionId]);*/

  async function logOut() {
    await authClient.signOut();
    router.refresh();
    // setSession(undefined);
    router.push("/auth/signin");
  }

  /**
   * Vérifie le rôle actif de l'utilisateur dans l'organisation courante.
   * Si une organisation est présente dans la session et qu'un rôle est retourné
   * par l'API, met à jour la session uniquement si le rôle diffère de celui
   * déjà stocké (évite des mises à jour inutiles).
   */
  async function verifyUserInOrganization() {
    if (!s?.isRoleOrg) return;
    const { data, error } = await authClient.organization.getActiveMemberRole();
    if (error || !data) return false;
    console.log("verifyRole: ", data);

    const newRole = data.role;

    setSession({
      ...s,
      isRoleOrg: newRole,
    });
  }

  return {
    session: s ?? null,
    // isAdmin,
    logOut,
    verifySessionInOrganization: verifyUserInOrganization,
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
