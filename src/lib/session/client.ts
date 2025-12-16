"use client";

import { authClient } from "@/lib/auth/auth.client";

export function getCurrentClientSession() {
  const session = authClient.useSession();
  return session;
}
