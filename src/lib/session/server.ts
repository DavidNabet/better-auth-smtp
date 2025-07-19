import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getCurrentServerSession() {
  "use server";
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return {
    userId: session?.user.id!,
    userEmail: session?.user.email!,
    userRole: session?.user.role!,
    userName: session?.user ? session.user.name : "",
    sessionToken: session?.session.token,
    expiresAt: session?.session.expiresAt,
  };
}
