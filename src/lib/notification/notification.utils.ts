"use server";

import { db } from "@/db";
import { getCurrentUser } from "../user/user.utils";

export async function getNotificationsByUserId() {
  try {
    const { user } = await getCurrentUser();
    const notifications = await db.notification.findMany({
      where: {
        userId: user.id,
      },
      include: {
        invitation: true,
        user: true,
      },
    });
    return notifications;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getNotificationByOrgId(orgId: string) {
  try {
    const notifications = await db.notification.findMany({
      where: {
        organizationId: orgId,
      },
      include: {
        user: true,
      },
    });
    return notifications;
  } catch (error) {
    console.error(error);
    return [];
  }
}
