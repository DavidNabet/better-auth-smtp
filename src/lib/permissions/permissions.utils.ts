import { authClient } from "@/lib/auth/auth.client";
import { Entities, PermissionFor } from "./permissions.types";
import { Role, CommentAction } from "@prisma/client";
import { db } from "@/db";

export type RoleType = (typeof Role)[
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MEMBER"
  | "USER"];

// client
export const hasClientPermission = <
  E extends Entities,
  P extends PermissionFor<E>,
>(
  role: RoleType,
  entity: E,
  permission: P
) => {
  return authClient.admin.checkRolePermission({
    permissions: { [entity]: [permission] },
    role: role!,
  });
};

export type AllModerationsLogs = Awaited<ReturnType<typeof allModerationsLogs>>;

export const allModerationsLogs = async () => {
  return await db.moderationLog.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      moderator: true,
      comment: true,
    },
  });
};

export type GetModerationActions = Awaited<
  ReturnType<typeof getModerationActionsTree>
>;

export async function getModerationActionsTree() {
  const hidden = await db.moderationLog.findMany({
    where: {
      action: "HIDE_COMMENT" as CommentAction,
    },
    select: {
      id: true,
      action: true,
      createdAt: true,
      updatedAt: true,
      moderator: true,
    },
  });

  const deleted = await db.moderationLog.findMany({
    where: {
      action: "DELETE_COMMENT" as CommentAction,
    },
    select: {
      id: true,
      action: true,
      createdAt: true,
      updatedAt: true,
      moderator: true,
    },
  });

  return [
    {
      id: "hide",
      action: "HIDE_COMMENT",
      children: hidden,
    },
    {
      id: "delete",
      action: "DELETE_COMMENT",
      children: deleted,
    },
  ] as const;
}
