"use server";

import { db } from "@/db";
import { getOrganizationById } from "@/lib/organization/organization.utils";
import { CreateAppSchema } from "./app.schema";
import { APIError } from "better-auth/api";

export async function getApps() {
  // const { currentUser } = await getCurrentUser();

  try {
    // Implemented in db by default
    // const activeOrganization = await getActiveOrganization(currentUser.id);

    const apps = await db.app.findMany();

    return apps;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createAppData(data: CreateAppSchema) {
  const { name, slug, description, logo, organizationId } = data;
  if (!organizationId) {
    throw new APIError("BAD_REQUEST", { message: "Organization not found" });
  }
  const organization = await getOrganizationById(organizationId);
  if (!organization) {
    throw new APIError("BAD_REQUEST", { message: "Organization not exist" });
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
        organization: {
          include: {
            teams: {
              select: {
                _count: true,
              },
            },
            members: {
              orderBy: {
                role: "desc",
              },
            },
          },
        },
        feedbacks: {
          include: {
            comments: {
              take: 5,
              select: {
                content: true,
                isHidden: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            votes: {
              select: {
                type: true,
              },
            },
          },
        },
      },
    });

    if (!getSlug) {
      return null;
    }

    return {
      ...getSlug,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function filterAppsByTeam() {
  try {
  } catch (error) {}
}
