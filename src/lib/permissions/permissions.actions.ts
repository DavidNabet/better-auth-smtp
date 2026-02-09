// server
"use server";

import { auth } from "@/lib/auth";
import {
  Entities,
  PermissionFor,
  OrgEntites,
  PermissionOrgFor,
} from "./permissions.types";
import { headers } from "next/headers";

export const hasServerPermission = async <
  E extends Entities,
  P extends PermissionFor<E>,
>(
  entity: E,
  permission: P,
) => {
  try {
    const { error, success } = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        permissions: { [entity]: [permission] },
      },
    });

    if (error) {
      throw new Error(error);
    }

    if (!success) {
      throw new Error("You don't have permission to perform this action");
    }
    return success;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    console.log("[hasPermission]: ", error);
    throw new Error("An error occurred while checking server permission");
  }
};

export const hasServerOrgPermission = async <
  O extends OrgEntites,
  P extends PermissionOrgFor<O>,
>(
  entity: O,
  permission: P,
) => {
  try {
    const { error, success } = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: { [entity]: [permission] },
      },
    });

    if (error) {
      throw new Error(error);
    }

    if (!success) {
      throw new Error("You don't have permission to perform this action");
    }
    return success;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    console.log("[hasPermission]: ", error);
    throw new Error("An error occurred while checking server permission");
  }
};
