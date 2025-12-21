import { createAuthClient } from "better-auth/react";
import { createAuthClient as createAuthServer } from "better-auth/client";
import {
  twoFactorClient,
  adminClient,
  inferAdditionalFields,
  organizationClient,
  inferOrgAdditionalFields,
} from "better-auth/client/plugins";
import { ac, MEMBER, ADMIN, USER, SUPER_ADMIN } from "../user/user.service";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import {
  dc,
  owner,
  admin as adm,
  member,
} from "../organization/organization.service";

export type User = (typeof authServer.$Infer.Session)["user"];

// Access role from server in the client
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [
    twoFactorClient(),
    inferAdditionalFields<typeof auth>(),
    adminClient({
      defaultRole: Role.USER,
      adminRoles: [Role.ADMIN, Role.MEMBER, Role.OWNER],
      ac,
      roles: {
        USER,
        MEMBER,
        ADMIN,
        SUPER_ADMIN,
      },
    }),
    organizationClient({
      ac: dc,
      roles: {
        owner,
        admin: adm,
        member,
      },
      teams: {
        enabled: true,
      },
      schema: inferOrgAdditionalFields<typeof auth>(),
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
      defaultRole: Role.USER,
      adminRoles: [Role.ADMIN, Role.MEMBER],
      ac,
      roles: {
        USER,
        MEMBER,
        ADMIN,
        SUPER_ADMIN,
      },
    }),
    organizationClient(),
  ],
});
