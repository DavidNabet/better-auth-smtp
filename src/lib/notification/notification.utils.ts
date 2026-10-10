"use server";

import { db } from "@/db";

// get all notifications by organization Id with insensitive search
export async function getNotificationByOrgId(orgId: string) {
  try {
    const notifications = await db.notification.findMany({
      where: {
        organizationId: {
          mode: "insensitive",
          contains: orgId,
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return notifications;
  } catch (error) {
    console.error(error);
    return [];
  }
}
