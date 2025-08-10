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

    sendVerificationEmail: async ({ user, url }) => {
      console.log("sendVerificationEmail: ", url);
      await sendMagicLinkforLogin(user.name, user.email, url);
    },
    // afterEmailVerification: async (user, request) => {
    //   console.log(
    //     `${user.email} has successfully verified their email address!`
    //   );
    // },
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
      update: {
        after: async (user) => {
          const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

          if (ADMIN_EMAIL.includes(user.email as string)) {
            // return { data: { ...user, role: Role.ADMIN } };
            await db.user.update({
              where: { id: user.id },
              data: {
                role: Role.ADMIN,
              },
            });
          }

          // return { data: user };
        },
      },
    },
  },
  logger: {
    disabled: false,
    level: "error",
    log(level, message, ...args) {
      console.log(`${[level]} ${message}`, ...args);
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
      adminUserIds: ["97xYFyzQ9JXQdDgNilbEwg77Nl4tXGLN"],
    }),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendOTPforLogin(user.name, user.email, otp);
        },
      },
      skipVerificationOnEnable: true,
    }),
    // multiSession(),
    // magicLink({
    //   sendMagicLink: async ({ email, url, token }) => {
    //     await sendMagicLinkforLogin("", email, url);
    //   },
    // }),
  ],
});
