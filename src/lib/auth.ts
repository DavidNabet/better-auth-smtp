import { betterAuth, logger } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { headers } from "next/headers";
import { admin, twoFactor, organization } from "better-auth/plugins";
import { inbox } from "better-inbox";
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
import {
  createDefaultTeams,
  findTeamByName,
  getActiveOrganization,
} from "@/lib/organization/organization.utils";
import { getUserById } from "./user/user.utils";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  // trustedOrigins: [
  //   process.env.BASE_URL ?? "",
  //   "https://l98pnvl5-3000.uks1.devtunnels.ms/",
  // ],
  baseURL: {
    allowedHosts: ["localhost:3000", "localhost:3001"],
    fallback: process.env.BETTER_AUTH_URL ?? "",
  },
  emailVerification: {
    beforeEmailVerification: async (user, req) => {
      console.info("Request before verification", user.email);
    },
    sendVerificationEmail: async ({ user, url }) => {
      console.info("Verification email sent to", user.email);
      await sendMagicLinkforLogin(user.name, user.email, url);
    },
    afterEmailVerification: async (user, req) => {
      console.info("Request verification: ", req);
      console.log(
        `${user.email} has successfully verified their email address!`,
      );
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
    sendOnSignIn: true,
    // afterEmailVerification: async (user, request) => {
    //   console.log(
    //     `${user.email} has successfully verified their email address!`
    //   );
    // },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
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
      notificationStatus: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
      },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user, request) => {
        // P1.4 — correspondance EXACTE (évite le substring match et le crash si var absente).
        const ADMIN_EMAILS =
          process.env.ADMIN_EMAIL?.split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean) ?? [];
        if (ADMIN_EMAILS.includes((user.email ?? "").toLowerCase())) {
          throw new APIError("BAD_REQUEST", {
            message: "Admin accounts can't be deleted",
          });
        }
      },
      afterDelete: async (user, request) => {
        console.info(`User ${user.email} account is deleted`);
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 3,
    deferSessionRefresh: true,
    // cookieCache: {
    //   enabled: true,
    //   maxAge: 60 * 60 * 24,
    //   strategy: "compact",
    //   version: "2",
    // },
  },
  advanced: {
    defaultCookieAttributes: {
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
    ipAddress: {
      ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
    },
  },
  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
  verification: {
    disableCleanup: false,
  },
  // TODO: Pour n'importe quel user qui n'est pas owner, l'activeOrganizationId est égale à l'organizationId du membre owner par défaut
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
          // P1.4 — correspondance EXACTE (cohérent avec beforeDelete).
          const ADMIN_EMAILS =
            process.env.ADMIN_EMAIL?.split(",")
              .map((e) => e.trim().toLowerCase())
              .filter(Boolean) ?? [];
          if (ADMIN_EMAILS.includes((user.email ?? "").toLowerCase())) {
            console.info("auth db user updated: ", user.name);

            // return { data: { ...user, role: Role.ADMIN } };
            await db.user.update({
              where: { id: user.id },
              data: {
                role: Role.SUPER_ADMIN,
              },
            });
            // await auth.api.adminUpdateUser({
            //   body: {
            //     userId: user.id,
            //     data: {
            //       role: Role.SUPER_ADMIN,
            //     },
            //   },
            //   headers: await headers(),
            // });
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

          console.info("Not invite");
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
      // P1.4 — ids admin pilotés par env, avec repli sûr sur la valeur commitée.
      adminUserIds: process.env.ADMIN_USER_IDS?.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      impersonationSessionDuration: 60 * 60 * 24,
    }),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          console.info("OTP sent to: ", user.email);
          await sendOTPforLogin(user.name, user.email, otp);
        },
      },
      skipVerificationOnEnable: true,
    }),
    organization({
      requireEmailVerificationOnInvitation: true,
      allowUserToCreateOrganization(user) {
        return user.email === process.env.ADMIN_EMAIL;
      },
      cancelPendingInvitationsOnReInvite: true,
      organizationHooks: {
        // FIX: L'utilisateur doit d'abord créer un compte puis accepter l'invitation envoyé par mail
        // path: api/accept-invitation/:invitationId
        beforeAcceptInvitation: async ({ invitation, organization, user }) => {
          console.log(`Adding ${invitation.email} to ${organization.name}`);
          const inviter = await getUserById(invitation.inviterId);
          await auth.api.notify({
            body: {
              userId: user.id,
              organizationId: organization.id,
              type: "before_accept.invitation",
              title:
                `${inviter?.email} vous a invité à rejoindre l'organisation ${organization.name}` ||
                `Vous êtes invité à rejoindre l'organisation ${organization.name}`,
              href: `/dashboard/orgs/${organization.slug}`,
              roles: ["member"],
            },
          });
        },
        afterAcceptInvitation: async ({
          invitation,
          organization,
          user,
          member,
        }) => {
          console.info("after Accept Invitation: ", user.email);
          const inviter = await getUserById(invitation.inviterId);
          if (user?.role === Role.USER) {
            const data = await (
              await auth.$context
            ).internalAdapter.updateUser(user.id, { role: Role.MEMBER });
            console.log("changing role...", data?.role);
            // await db.user.update({
            //   where: { id: user.id },
            //   data: {
            //     role: Role.MEMBER,
            //   },
            // });
          }
          // User has accepted invitation
          await auth.api.notify({
            body: {
              userId: inviter?.id,
              organizationId: organization.id,
              type: "after_accept.invitation",
              title: `${user.email} à rejoint l'organisation ${organization.name}`,
              href: `/dashboard/orgs/${organization.slug}`,
              roles: ["owner", "admin"],
            },
          });
          // logout user after accepting invitation to update session with new role and permissions
        },
        afterCancelInvitation: async ({
          invitation,
          organization,
          cancelledBy,
        }) => {
          console.info(
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
          console.info("Organization created: ", organization);
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

        // TODO: Ajouter un champ createdBy dans le model Team pour envoyer l'userId au notify
        afterAddTeamMember: async ({
          teamMember,
          team,
          organization,
          user,
        }) => {
          console.info(
            `✅ afterAddTeamMember: ${user.email} added on ${team.name}`,
          );
        },
        afterUpdateMemberRole: async ({
          member,
          previousRole,
          user,
          organization,
        }) => {
          console.info(
            `✅ UpdateMemberRole: ${user.email} role => ${member.role}`,
          );
          if (previousRole === "member") {
            // await auth.api.adminUpdateUser({
            //   body: {
            //     userId: user.id,
            //     data: {
            //       role: Role.ADMIN,
            //     },
            //   },
            // });
            await auth.api.notify({
              body: {
                // userId: user.id,
                organizationId: organization.id,
                type: "member_role_changed",
                title: `L'organisateur vous a promu au rang de ${member.role}`,
                roles: ["admin", "member"],
              },
            });
            // await db.user.update({
            //   where: { id: user.id },
            //   data: {
            //     role: Role.ADMIN,
            //   },
            // });
          } else if (previousRole === "admin") {
            // await auth.api.adminUpdateUser({
            //   body: {
            //     userId: user.id,
            //     data: {
            //       role: Role.MEMBER,
            //     },
            //   },
            //   headers: await headers(),
            // });
            await auth.api.notify({
              body: {
                // userId: user.id,
                organizationId: organization.id,
                type: "member_role_changed",
                title: `L'organisateur vous a rétrograder au rang de ${member.role}`,
                roles: ["member", "admin"],
              },
            });
            // await db.user.update({
            //   where: { id: user.id },
            //   data: {
            //     role: Role.MEMBER,
            //   },
            // });
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
        // data.role
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/accept-invitation/${data.id}`;
        console.info("Invitation Email: ", data.email);

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
            logo: {
              type: "string",
              required: false,
              input: false,
            },
            slug: {
              type: "string",
              required: true,
              input: true,
              returned: true,
            },
            // createdBy: {
            //   type: "string",
            //   required: false,
            //   input: true,
            //   returned: true,
            // },
          },
        },
      },
    }),
    nextCookies(),
    inbox(),
    // multiSession(),
    // magicLink({
    //   sendMagicLink: async ({ email, url, token }) => {
    //     await sendMagicLinkforLogin("", email, url);
    //   },
    // }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
export type Member = typeof auth.$Infer.Member;
export type Organizations = typeof auth.$Infer.Organization;
export type Invitation = typeof auth.$Infer.Invitation;
