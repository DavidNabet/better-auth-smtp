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
import { User } from "better-auth";
// import { Session } from "@/lib/auth";
import { admin } from "@/lib/user/user.service";
import { auth } from "@/lib/auth";

type SessionClient = (typeof authClient.$Infer.Session)["session"];

interface AuthContextType {
  session?: SessionClient;
  isAdmin: boolean;
  logOut: Function;
  verifySession: Function;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
// type UserRole = (typeof auth.$Infer.Session)["user"];

export function useAuthState() {
  const [s, setSession] = useState<SessionClient | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    (async function run() {
      const { data } = await getCurrentClientSession();
      setSession(data?.session!);
      console.log("session provider: ", data);
    })();
  }, []);
  useEffect(() => {
    // Role
    if (!s?.id) return;
    async function run() {
      const { data } = await authServer.admin.listUsers({
        query: {
          filterField: "role",
          filterOperator: "eq",
          filterValue: "ADMIN",
        },
      });
      const isAdmin = !!data?.users.find((user) => user.id === s?.userId);
      console.log("isAdmin: ", isAdmin);

      setIsAdmin(isAdmin);
    }
    run();
  }, [s?.id]);

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
      setSession(data?.session!);
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
