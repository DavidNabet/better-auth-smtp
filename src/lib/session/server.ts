"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unstable_cache as cache } from "next/cache";

export const getCurrentServerSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};
// ["auth-session"],
// { tags: ["auth-session"], revalidate: 60 },

// return {
//     userId: session?.user.id!,
//     userEmail: session?.user.email!,
//     userRole: session?.user.role!,
//     userImage: session?.user.image!,
//     userName: session?.user ? session.user.name : "",
//     sessionToken: session?.session.token,
//     expiresAt: session?.session.expiresAt,
//     notificationsEnabled: session?.user.notificationStatus!,
//   };
