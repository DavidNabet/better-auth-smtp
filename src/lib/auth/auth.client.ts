import { createAuthClient } from "better-auth/react";
import { createAuthClient as createAuthServer } from "better-auth/client";
import {
  twoFactorClient,
  adminClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { ac, MEMBER, ADMIN, MODERATOR } from "../user/user.service";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

export type User = (typeof authServer.$Infer.Session)["user"];

// Access role from server in the client
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [
    twoFactorClient(),
    inferAdditionalFields<typeof auth>(),
    adminClient({
      defaultRole: Role.MEMBER,
      adminRoles: [Role.ADMIN, Role.MODERATOR],
      ac,
      roles: {
        MEMBER,
        ADMIN,
        MODERATOR,
      },
    }),
  ],
  fetchOptions: {
    onError: async (context) => {
      const { response } = context;
      if (response.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After");
        console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
      }
    },
  },
});

export const authServer = createAuthServer({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [
    twoFactorClient(),
    adminClient({
      defaultRole: Role.MEMBER,
      adminRoles: [Role.ADMIN, Role.MODERATOR],
      ac,
      roles: {
        MEMBER,
        ADMIN,
        MODERATOR,
      },
    }),
  ],
});
