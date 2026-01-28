// server
"use server";

import { auth } from "@/lib/auth";
import { Entities, PermissionFor, OrgEntites } from "./permissions.types";
import { headers } from "next/headers";

export const hasServerPermission = async <
  E extends Entities,
  O extends OrgEntites,
  P extends PermissionFor<E, O>,
>(
  entity: E | O,
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
