"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/user/user.utils";
import { RoleType } from "../permissions/permissions.utils";

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

  const activeOrganization = await db.organization.findFirst({
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
