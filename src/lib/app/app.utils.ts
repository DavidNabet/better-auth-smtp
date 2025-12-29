"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/user/user.utils";
import { RoleType } from "@/lib/permissions/permissions.utils";
import {
  getActiveOrganization,
  getCurrentMember,
  getOrganizationById,
} from "@/lib/organization/organization.utils";
import { CreateAppSchema } from "./app.schema";
import { APIError } from "better-auth/api";
import { slugify } from "../utils";

export async function getApps() {
  const { currentUser } = await getCurrentUser();

  // Implemented in db by default
  const activeOrganization = await getActiveOrganization(currentUser.id);

  const apps = await db.app.findMany({
    where: {
      organizationId: activeOrganization?.id,
    },
  });

  return apps;
}

export async function createAppData(data: CreateAppSchema) {
  const { name, slug, description, logo, organizationId } = data;
  const organization = await getOrganizationById(organizationId);
  if (!organization) {
    throw new APIError("BAD_REQUEST", { message: "Organization not found" });
  }
  if (slug === organization.slug) {
    throw new APIError("NOT_ACCEPTABLE", { message: "Slug already exists" });
  }

  const app = await db.app.create({
    data: {
      name,
      slug: slug,
      description,
      logo: String(logo),
      organizationId,
    },
  });
  return app;
}

export async function getAppBySlug(slug: string) {
  try {
    const getSlug = await db.app.findUnique({
      where: { slug },
      include: {
        feedbacks: {
          include: {
            comments: {
              take: 3,
              select: {
                content: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!getSlug) {
      return null;
    }

    const member = await getCurrentMember();

    return {
      ...getSlug,
      member: member ? member : null,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
