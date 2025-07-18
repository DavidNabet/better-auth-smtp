import { authClient } from "@/lib/auth/auth.client";

export async function getCurrentClientSession() {
  const session = await authClient.getSession();
  return session;
}
