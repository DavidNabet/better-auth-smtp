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
          organization: ["org-update", "org-delete"],
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
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          updatedAt: true,
          createdAt: true,
        },
      },
    },
  });

  // Récupère toutes les invitations en attente pour cette organization
  const pendingInvitations = await db.invitation.findMany({
    where: { organizationId },
    include: {
      user: true,
    },
  });

  // Transforme les membres confirmés au formate unifié
  const formattedMembers = confirmedMembers.map((member) => ({
    id: member.id,
    email: member.user.email,
    name: member.user.name,
    image: member.user.image,
    userId: member.userId,
    status: "accepted" as const,
    role: member.role,
    createdAt: member.createdAt,
    invitationId: null,
    expiresAt: null,
    updatedAt: member.user.updatedAt,
  }));

  // Transforme les invitations en attente au format unifié
  const formattedInvitations = pendingInvitations.map((invitation) => ({
    id: null,
    email: invitation.email,
    name: invitation.user.name,
    image: invitation.user.image,
    status: invitation.status as string,
    role: invitation.role || "member",
    createdAt: invitation.expiresAt,
    invitationId: invitation.id,
    expiresAt: invitation.expiresAt,
    userId: invitation.user.id,
    updatedAt: invitation.user.updatedAt,
  }));

  // Combine les deux listes
  return [...formattedMembers, ...formattedInvitations];
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

  return user;
}
