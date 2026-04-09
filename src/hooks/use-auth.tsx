"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
  useLayoutEffect,
  use,
} from "react";
import { authClient, authServer } from "@/lib/auth/auth.client";
import { useRouter } from "next/navigation";
import { getCurrentClientSession } from "@/lib/session/client";
// import { Session } from "@/lib/auth";
import { APIError } from "better-auth/api";
import {
  hasClientPermission,
  RoleType,
} from "@/lib/permissions/permissions.utils";
import { Role } from "@prisma/client";
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

type SessionUser = Awaited<ReturnType<typeof sessionDto>>;

interface AuthContextType {
  session?: SessionUser;
  // isAdmin: boolean;
  logOut: () => void;
  verifySession: () => void;
  verifySessionInOrganization: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
// type UserRole = (typeof auth.$Infer.Session)["user"];

export function useAuthState() {
  const [s, setSession] = useState<SessionUser | undefined>(undefined);
  // const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    (async function run() {
      const { data } = await authClient.getSession();
      const filteredData = sessionDto(data as SessionServer);
      setSession(filteredData);
      console.log("session provider: ", data);

      return () => {
        setSession(undefined);
      };
    })();
  }, []);

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
          "Erreur lors de la verification du role ActiveMember ",
          error,
        );
      }
    })();

    return () => {
      mounted = false;
    };
  }, [s?.activeOrgId, s?.isRoleOrg]);
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
    const { data, error } = await authClient.revokeSession({
      token: s?.token!,
    });
    console.log("logout: ", data, error);
    setSession(undefined);
  }

  async function verifySessionAndSave() {
    const { data, isPending, error } = authClient.useSession();
    if (!error && !isPending) {
      // userRole: data?.user?.role,
      const filteredData = sessionDto(data as SessionServer);
      setSession(filteredData);
    } else {
      router.refresh();
      router.push("/auth/signin");
    }
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
    session: s,
    // isAdmin,
    logOut,
    verifySession: verifySessionAndSave,
    verifySessionInOrganization: verifyUserInOrganization,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthState();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = use(AuthContext);
  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return auth;
}
