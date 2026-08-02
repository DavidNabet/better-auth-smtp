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
): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return false;
    const { error, success } = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        permissions: { [entity]: [permission] },
      },
    });

    if (error) {
      console.error("Permission check failed ", error);
      return false;
    }
    return success;
  } catch (error) {
    console.error("Permission check failed ", error);
    return false;
  }
};

export const hasServerOrgPermission = async <
  O extends OrgEntites,
  P extends PermissionOrgFor<O>,
>(
  entity: O,
  permission: P,
): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return false;

    const { error, success } = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: { [entity]: [permission] },
      },
    });

    if (error) {
      console.error("Permission check failed ", error);
      return false;
    }

    return success;
  } catch (error) {
    console.error("Permission check failed ", error);
    return false;
  }
};
