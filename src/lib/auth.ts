import { betterAuth, logger } from "better-auth";

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
    sendOnSignIn: true,

    sendVerificationEmail: async ({ user, url }) => {
      logger.info("Email verification", `Sending verification url ${url}`);
      await sendMagicLinkforLogin(user.name, user.email, url);
    },
    // afterEmailVerification: async (user, request) => {
    //   console.log(
    //     `${user.email} has successfully verified their email address!`
    //   );
    // },
  },
  logger: {
    disabled: false,
    level: "error",
    log(level, message, ...args) {
      console.log(`${[level]} ${message}`, ...args);
    },
  },
  onAPIError: {
    throw: false,
    onError: (error, ctx) => {
      if (error instanceof Error) {
        logger.error("Auth error: ", error, " ctx: ", ctx);
      }
    },
  },
  // Secondary storage uniquement
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    window: 30,
    max: 50,
    storage: "database",
    modelName: "rateLimit",
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
      afterDelete: async (user, request) => {
        logger.info(`User ${user.email} account is deleted`);
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30,
    },
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 3,
  },
  advanced: {
    defaultCookieAttributes: {
      maxAge: 60 * 60 * 24 * 7,
    },
    ipAddress: {
      ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
    },
  },
  verification: {
    disableCleanup: false,
  },
  databaseHooks: {
    user: {
      update: {
        after: async (user, ctx) => {
          const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

          if (ADMIN_EMAIL.includes(user.email!)) {
            logger.info("db.user.update.after");
            // return { data: { ...user, role: Role.ADMIN } };
            await db.user.update({
              where: { id: user.id },
              data: {
                role: Role.ADMIN,
              },
            });
          }
        },
      },
      // create: {
      //   after: async (user, ctx) => {
      //     if (ctx?.path.startsWith("/admin/create-user")) {
      //       console.log("after created users");
      //       console.log("Sending emails: ", ctx?.context.session?.session);
      //       // await sendMagicLinkforLogin(user.name, user.email, user.id)
      //     }
      //   },
      // },
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
      impersonationSessionDuration: 60 * 60 * 24,
    }),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          logger.info("OTP sent to: ", user.email);
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
