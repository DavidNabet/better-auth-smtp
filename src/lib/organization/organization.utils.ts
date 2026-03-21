"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { getCurrentUser, getUserById } from "@/lib/user/user.utils";

export const isAdminInOrg = async () => {
  try {
    const { success, error } = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          organization: ["update", "delete"],
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error || "Failed to check permissions",
      };
    }
    return success;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error || "Failed to check permissions",
    };
  }
};

// Organizations
export async function getOrganizations() {
  const { currentUser } = await getCurrentUser();

  try {
    const members = await db.member.findMany({
      where: { userId: currentUser.id },
    });

    const organizations = await db.organization.findMany({
      where: {
        id: {
          in: members.map((m) => m.organizationId),
        },
      },
    });

    return organizations;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getActiveOrganization(userId: string) {
  const memberUser = await db.member.findFirst({
    where: { userId },
  });

  if (!memberUser) {
    return null;
  }

  const activeOrganization = await db.organization.findUnique({
    where: { id: memberUser.organizationId },
  });

  return activeOrganization;
}

export async function getOrganizationBySlug(slug: string) {
  try {
    const organizationBySlug = await db.organization.findFirst({
      where: { slug },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    return organizationBySlug;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function getOrganizationById(id: string) {
  try {
    const organizationById = await db.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    return organizationById;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// recuperer le statut des membres présents dans l'organization
export async function getMembersInvitationStatus(organizationId: string) {
  // Récupère tous les members confirmés de l'organization
  const confirmedMembers = await db.member.findMany({
    where: { organizationId },
    include: {
      user: true,
    },
  });

  // return confirmedMembers;

  // Récupère toutes les invitations en attente pour cette organization
  /*const pendingInvitations = await db.invitation.findMany({
    where: { organizationId },
    include: {
      user: true,
    },
  });*/

  // Transforme les membres confirmés au formate unifié
  const formattedMembers = confirmedMembers.map((member) => ({
    id: member.id,
    email: member.user.email,
    name: member.user.name,
    image: member.user.image,
    userId: member.userId,
    organizationId: member.organizationId,
    // status: "accepted" as const,
    role: member.role,
    createdAt: member.createdAt,
    // invitationId: member.,
    updatedAt: member.user.updatedAt,
  }));

  // Transforme les invitations en attente au format unifié
  /*const formattedInvitations = pendingInvitations.map((invitation) => ({
    status: invitation.status as string,
    role: invitation.role || "",
    invitationId: invitation.id,
    expiresAt: invitation.expiresAt,
    userId: invitation.user.id,
    updatedAt: invitation.user.updatedAt,
  }));*/

  return [...formattedMembers];
}

// Recupérer l'id d'Organization sans passer par Member
export async function getInvitationsByOrgId(organizationId: string) {
  try {
    const invitations = await db.invitation.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    return invitations;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getCurrentMember() {
  const { currentUser } = await getCurrentUser();

  const member = await db.member.findFirst({
    where: { userId: currentUser.id },
  });

  if (!member) {
    return null;
  }

  const user = await getUserById(member.userId);

  if (!user) return null;

  return user;
}

export async function getActiveMemberRole() {
  const { role } = await auth.api.getActiveMemberRole({
    headers: await headers(),
  });

  return { role };
}

// Filtrer les teams en fonction des organizations
export async function filterTeamsByOrganization(organizationId: string) {
  const { currentUser } = await getCurrentUser();
  try {
    const members = await db.member.findMany({
      where: { userId: currentUser.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const teams = await db.team.findMany({
      where: {
        organizationId: {
          in: members.map((m) => m.organizationId),
          equals: organizationId,
        },
        AND: {
          name: { notIn: members.map((m) => m.organization.name) },
        },
      },
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                name: true,
                role: true,
                image: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return teams;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Don't create the same team name
export async function findTeamByName(teamName: string, organizationId: string) {
  const team = await db.team.findFirst({
    where: {
      name: { equals: teamName },
      AND: {
        organizationId: organizationId,
      },
    },
  });

  return team;
}

// TODO : Gérer les permissions d'accès pour les membres

// Create default teams for init
// Chaque organization a ses propres teams
export async function createDefaultTeams(
  organizationId: string,
  userId: string,
) {
  // Crée deux équipes par défaut pour une organisation donnée.
  // - "Admin": pour les rôles admin et owner
  // - "Moderation": pour les rôles admin, owner et member
  // Remarque:
  //   Le mapping des permissions/roles est géré par l'access control (voir organization.service.ts).
  //   Ici, on crée uniquement les entités Team et on évite les doublons par nom au sein d'une même organization.
  try {
    if (!organizationId) {
      throw new Error("organizationId manquant");
    }

    // Vérifier si les équipes existent déjà pour éviter de créer des doublons.
    const [adminTeam, moderationTeam] = await Promise.all([
      findTeamByName("Admin", organizationId),
      findTeamByName("Moderation", organizationId),
    ]);

    const ops: Promise<unknown>[] = [];

    if (!adminTeam) {
      ops.push(
        db.team.create({
          data: {
            name: "Admin",
            description: "Equipe d'administration (accès: roles admin, owner).",
            organizationId,
            teamMembers: {
              create: {
                userId,
              },
            },
          },
        }),
      );
    }

    if (!moderationTeam) {
      ops.push(
        db.team.create({
          data: {
            name: "Moderation",
            description:
              "Equipe de modération (accès: roles admin, owner, member).",
            organizationId,
            teamMembers: {
              create: {
                userId,
              },
            },
          },
        }),
      );
    }

    if (ops.length > 0) {
      await Promise.all(ops);
    }

    return { success: true } as const;
  } catch (error) {
    console.error("Erreur createDefaultTeams:", error);
    return {
      success: false,
      error: (error as Error)?.message ?? String(error),
    } as const;
  }
}
