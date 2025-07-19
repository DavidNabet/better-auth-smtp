import { createAuthClient } from "better-auth/react";
import { createAuthClient as createAuthServer } from "better-auth/client";
import {
  twoFactorClient,
  adminClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { ac, user, admin } from "../user/user.service";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

// Access role from server in the client
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [twoFactorClient(), inferAdditionalFields<typeof auth>()],
});

export const authServer = createAuthServer({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [
    twoFactorClient(),
    adminClient({
      defaultRole: Role.USER,
      adminRoles: [Role.ADMIN],
      ac,
      roles: {
        user,
        admin,
      },
    }),
  ],
});
