"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/user/user.utils";
import { RoleType } from "@/lib/permissions/permissions.utils";
import { getOrganizationBySlug } from "@/lib/organization/organization.utils";
import { CreateAppSchema } from "./app.schema";
import { APIError } from "better-auth/api";

export async function getApps() {
  const { currentUser } = await getCurrentUser();
}

export async function createAppData(data: CreateAppSchema) {
  const { name, slug, description, logo, organizationId } = data;
  const organization = await getOrganizationBySlug(organizationId);
  if (!organization) {
    throw new APIError("BAD_REQUEST", { message: "Organization not found" });
  }
  if (slug === organization.slug) {
    throw new APIError("NOT_ACCEPTABLE", { message: "Slug already exists" });
  }

  const app = await db.app.create({
    data: {
      name,
      slug,
      description,
      logo: String(logo),
      organizationId,
    },
  });
  return app;
}
