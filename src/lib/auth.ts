import { betterAuth, logger } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { headers } from "next/headers";
import { admin, twoFactor, username, organization } from "better-auth/plugins";
import {
  sendMagicLinkforLogin,
  sendOTPforLogin,
  sendInviteEmail,
  sendCancelInvitation,
} from "@/lib/auth/auth.mails";
import { ac, USER, MEMBER, ADMIN, SUPER_ADMIN } from "@/lib/user/user.service";
import { Role } from "@prisma/client";
import {
  dc,
  member,
  owner,
  admin as adm,
} from "./organization/organization.service";
import { getUserByEmail } from "@/lib/user/user.utils";
import {
  createDefaultTeams,
  findTeamByName,
  getActiveOrganization,
} from "@/lib/organization/organization.utils";

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
export type Member = typeof auth.$Infer.Member;
export type Organizations = typeof auth.$Infer.Organization;
export type Invitation = typeof auth.$Infer.Invitation;

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: {
    allowedHosts: [process.env.BETTER_AUTH_URL?.split("https://")[0]!],
    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
  },
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
    window: 10,
    max: 50,
    storage: "database",
    modelName: "rateLimit",
    customRules: {
      "/sign-in/email": {
        window: 10,
        max: 3,
      },
      "/two-factor/*": async (request) => {
        return {
          window: 10,
          max: 3,
        };
      },
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
      afterDelete: async (user, request) => {
        logger.info(`User ${user.email} account is deleted`);
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 3,
  },
  advanced: {
    defaultCookieAttributes: {
      maxAge: 60 * 60 * 24 * 7,
      secure: false,
      httpOnly: true,
    },
    ipAddress: {
      ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
    },
  },
  verification: {
    disableCleanup: false,
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const activeOrganization = await getActiveOrganization(
            session.userId,
          );
          return {
            data: {
              ...session,
              activeOrganizationId: activeOrganization?.id,
            },
          };
        },
      },
    },
    user: {
      update: {
        after: async (user, ctx) => {
          const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

          if (ADMIN_EMAIL.includes(user.email!)) {
            logger.info("auth db user updated: ", user.name);

            // return { data: { ...user, role: Role.ADMIN } };
            await db.user.update({
              where: { id: user.id },
              data: {
                role: Role.SUPER_ADMIN,
              },
            });
          }
        },
      },
      create: {
        // on sign up
        before: async (user, ctx) => {
          const pendingInvitation = await db.invitation.findFirst({
            where: {
              email: user.email, // leummouvixudu-6843@yopmail.com
              status: "pending",
            },
          });

          if (pendingInvitation) {
            return { data: { ...user, emailVerified: true } };
          }

          logger.info("Not invite");
          return { data: user };
        },
        //   after: async (user, ctx) => {
        //     if (ctx?.path.startsWith("/admin/create-user")) {
        //       console.log("after created users");
        //       console.log("Sending emails: ", ctx?.context.session?.session);
        //       // await sendMagicLinkforLogin(user.name, user.email, user.id)
        //     }
        //   },
      },
    },
  },
  plugins: [
    admin({
      defaultRole: Role.USER,
      adminRoles: [Role.ADMIN, Role.MEMBER, Role.SUPER_ADMIN],
      ac,
      roles: {
        USER,
        MEMBER,
        ADMIN,
        SUPER_ADMIN,
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
    organization({
      requireEmailVerificationOnInvitation: true,
      allowUserToCreateOrganization(user) {
        return user.id === process.env.SUPER_ADMIN_ID;
      },
      cancelPendingInvitationsOnReInvite: true,
      organizationHooks: {
        // FIX: L'utilisateur doit d'abord créer un compte puis accepter l'invitation envoyé par mail
        // path: api/accept-invitation/:invitationId
        beforeAcceptInvitation: async ({ invitation, organization }) => {
          logger.info(`Adding ${invitation.email} to ${organization.name}`);

          const exisitingUser = await getUserByEmail(invitation.email);

          if (!exisitingUser) {
            // await db.user.create({
            //   data: {
            //     email: invitation.email,
            //     name:
            //       invitation.email.split("@")[0] || `userinvited${Date.now()}`,
            //     role: Role.MEMBER,
            //     emailVerified: false,
            //     createdAt: new Date(),
            //     updatedAt: new Date(),
            //   },
            // });

            logger.info(
              `New user account created for ${invitation.email} during invitation acceptance`,
            );
          }
        },
        afterCancelInvitation: async ({
          invitation,
          organization,
          cancelledBy,
        }) => {
          logger.success(
            `Invitation for ${invitation.email} to join ${organization.name} has been cancelled by ${cancelledBy.name}`,
          );

          void (await sendCancelInvitation(
            invitation.email,
            invitation.name,
            organization.name,
            cancelledBy.name,
          ));
        },
        afterCreateOrganization: async ({ organization, member, user }) => {
          logger.info("Organization created: ", organization);
          await createDefaultTeams(organization.id, user.id);
        },
        beforeCreateTeam: async ({ team, organization, user }) => {
          const existingTeam = await findTeamByName(team.name, organization.id);
          if (existingTeam) {
            throw new APIError("BAD_REQUEST", {
              message: "Team name already exists in this organization",
            });
          }
        },
      },
      ac: dc,
      roles: {
        owner,
        admin: adm,
        member,
      },
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/accept-invitation/${data.id}`;
        logger.info("Invitation Email: ", data.email);

        await sendInviteEmail(
          data.email,
          data.inviter.user.name,
          data.inviter.user.email,
          data.organization.name,
          inviteLink,
        );
      },
      teams: {
        enabled: true,
        maximumTeams: 4,
        allowRemovingAllTeams: false,
      },
      schema: {
        team: {
          additionalFields: {
            description: {
              type: "string",
              required: false,
              input: true,
              returned: true,
            },
          },
        },
      },
    }),
    nextCookies(),
    // multiSession(),
    // magicLink({
    //   sendMagicLink: async ({ email, url, token }) => {
    //     await sendMagicLinkforLogin("", email, url);
    //   },
    // }),
  ],
});
