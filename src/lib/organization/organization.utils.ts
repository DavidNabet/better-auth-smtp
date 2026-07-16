"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { getCurrentUser, getUserById } from "@/lib/user/user.utils";
import { Invitation } from "@/lib/types";

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
    where: {
      userId: userId,
      role: "owner",
    },
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

export async function getAdminMemberRole(organizationId: string) {
  try {
    const members = await db.member.findMany({
      where: { organizationId, role: { not: "member" } },
      include: {
        user: true,
      },
    });
    const formattedMembers = members.map((member) => ({
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
    return [...formattedMembers];
  } catch (error) {
    console.error(error);
    return [];
  }
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
    // Get organizations the current user belongs to
    const memberships = await db.member.findMany({
      where: { userId: currentUser.id },
      select: {
        organization: { select: { name: true } },
        organizationId: true,
      },
    });

    const userOrgIds = memberships.map((m) => m.organizationId);

    // If user is not in this organization, return empty
    if (!userOrgIds.includes(organizationId)) {
      return [];
    }

    const teams = await db.team.findMany({
      where: {
        organizationId,
        name: { notIn: memberships.map((m) => m.organization.name) },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        createdAt: true,
        organization: {
          select: {
            slug: true,
          },
        },
        teamMembers: {
          select: {
            user: {
              select: {
                id: true,
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

export async function getTeamMembersWithOrgRole(teamId: string) {
  // Single query: team members + their org role via join
  return db.teamMember.findMany({
    where: { teamId },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          members: {
            where: { role: { not: "member" } },
            select: { role: true, organizationId: true },
          },
        },
      },
      team: { select: { organizationId: true } },
    },
  });
}

export async function getTeamDetails(teamSlug: string) {
  return await db.team.findFirst({
    where: { slug: teamSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      organization: { select: { id: true, name: true, slug: true } },
      teamMembers: {
        select: {
          id: true,
          userId: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
    },
  });
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

export async function getInvitations(
  organizationId: string,
  cursor?: string,
  limit = 5,
) {
  const params = new URLSearchParams({
    limit: String(limit),
  });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(
    `${process.env.BETTER_AUTH_URL}/src/app/api/organizations/${organizationId}/invitations?${params}`,
    {
      next: { tags: [`invitations:${organizationId}`] },
    },
  );
  if (!res.ok) throw new Error("Failed to fetch invitations");
  return res.json() as Promise<{
    invitations: Invitation[];
    nextCursor: string | null;
    total: number;
  }>;
}
