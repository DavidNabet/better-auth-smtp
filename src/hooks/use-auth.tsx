"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { authClient, authServer } from "@/lib/auth/auth.client";
import { useRouter } from "next/navigation";
import { getCurrentClientSession } from "@/lib/session/client";
// import { Session } from "@/lib/auth";
import { ADMIN } from "@/lib/user/user.service";
import { APIError } from "better-auth/api";
// import { auth } from "@/lib/auth";

type SessionServer = typeof authServer.$Infer.Session;

interface AuthContextType {
  session?: SessionUser;
  isAdmin: boolean;
  logOut: () => void;
  verifySession: () => void;
}

type SessionUser = {
  sessionId: SessionServer["session"]["id"];
  userId: SessionServer["session"]["userId"];
  userEmail: SessionServer["user"]["email"];
  userName: SessionServer["user"]["name"];
  userRole: SessionServer["user"]["role"];
  userImage: SessionServer["user"]["image"];
  sessionToken: SessionServer["session"]["token"];
  expiresAt: SessionServer["session"]["expiresAt"];
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
// type UserRole = (typeof auth.$Infer.Session)["user"];

export function useAuthState() {
  const [s, setSession] = useState<SessionUser | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    (async function run() {
      const { data } = await getCurrentClientSession();
      setSession({
        sessionId: data?.session.id!,
        userId: data?.user.id!,
        userEmail: data?.user.email!,
        userName: data?.user?.name!,
        userRole: data?.user.role,
        userImage: data?.user.image,
        sessionToken: data?.session.token!,
        expiresAt: data?.session.expiresAt!,
      });
      console.log("session provider: ", data);
    })();
  }, []);
  useEffect(() => {
    // Role
    if (!s?.sessionId) return;
    async function run() {
      const { data, error } = await authServer.admin.hasPermission({
        userId: s?.userId,
        role: "ADMIN",
        permission: { user: ["delete"] },
      });
      if (error) {
        throw new APIError("BAD_REQUEST", {
          message: error.message,
        });
      }

      console.log(data.success);

      // const isAdmin = !!data?.users.find((user) => user.id === s?.userId);

      setIsAdmin(data.success);
    }
    if (s.userRole === "ADMIN") {
      run();
    }
  }, [s?.sessionId]);

  async function logOut() {
    const { data, error } = await authClient.revokeSession({
      token: s?.sessionToken!,
    });
    console.log("logout: ", data, error);
    setSession(undefined);
  }

  async function verifySessionAndSave() {
    const { data, isPending, error } = authClient.useSession();
    if (!error && !isPending) {
      // userRole: data?.user?.role,
      setSession({
        sessionId: data?.session.id!,
        userId: data?.user.id!,
        userEmail: data?.user.email!,
        userName: data?.user?.name!,
        userRole: data?.user.role,
        userImage: data?.user.image,
        sessionToken: data?.session.token!,
        expiresAt: data?.session.expiresAt!,
      });
    } else {
      router.refresh();
      router.push("/auth/signin");
    }
  }

  return {
    session: s,
    isAdmin,
    logOut,
    verifySession: verifySessionAndSave,
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
