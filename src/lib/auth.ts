import { betterAuth } from "better-auth";

import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { createMiddleware } from "better-auth";
import { db } from "@/db";
import { admin, twoFactor, username } from "better-auth/plugins";
import { sendMagicLinkforLogin, sendOTPforLogin } from "@/lib/auth/auth.mails";
import { ac, USER, ADMIN, MODERATOR } from "@/lib/user/user.service";
import { getUserIdByEmail } from "@/lib/auth/auth.utils";
import { Role } from "@prisma/client";

export type Session = typeof auth.$Infer.Session;
export type User = (typeof auth.$Infer.Session)["user"];

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    autoSignIn: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,

    sendVerificationEmail: async ({ user, url }) =>
      sendMagicLinkforLogin(user.name, user.email, url),
  },
  onAPIError: {
    throw: true,
    onError: (error, ctx) => {
      if (error instanceof Error) {
        console.error("Auth error: ", error, " ctx: ", ctx);
      }
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.USER,
        input: false,
      },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user, request) => {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

        if (ADMIN_EMAIL.includes(user.email)) {
          throw new APIError("BAD_REQUEST", {
            message: "Admin accounts can't be deleted",
          });
        }
      },
    },
  },
  advanced: {
    defaultCookieAttributes: {
      maxAge: 60 * 60 * 24 * 7,
    },
  },
  verification: {
    disableCleanup: false,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

          if (ADMIN_EMAIL.includes(user.email)) {
            return { data: { ...user, role: Role.ADMIN } };
          }

          return { data: user };
        },
      },
    },
  },
  plugins: [
    nextCookies(),
    admin({
      defaultRole: Role.USER,
      adminRoles: [Role.ADMIN, Role.MODERATOR],
      ac,
      roles: {
        USER,
        ADMIN,
        MODERATOR,
      },
      adminUserIds: ["opyVqfdmTzClHczOzdwmxI5vOgbC9asO"],
    }),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendOTPforLogin(user.name, user.email, otp);
        },
      },
      skipVerificationOnEnable: true,
    }),
    username(),
    // multiSession(),
    // magicLink({
    //   sendMagicLink: async ({ email, url, token }) => {
    //     await sendMagicLinkforLogin("", email, url);
    //   },
    // }),
  ],
});
