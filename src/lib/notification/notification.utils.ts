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

export async function onMarkAsRead(notificationId: string) {
  try {
    const notification = await db.notification.update({
      where: { id: notificationId },
      data: {
        status: "accepted",
        read: true,
      },
    });
    return notification;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// onClearAll,
// onDelete,
// onMarkAllAsRead,
