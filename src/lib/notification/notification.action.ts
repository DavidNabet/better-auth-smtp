"use server";

import { ActionState } from "@/lib/feedback/feedback.types";
import { toAction, toActionState } from "@/lib/feedback/feedback.utils";
import { notificationSettingSchema } from "@/lib/notification/notification.schema";
import { headers as head } from "next/headers";
import { db } from "@/db";
import { ErrorTypes } from "../user/user.actions";
import { APIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { hasServerPermission } from "../permissions/permissions.actions";
import { FormState } from "../user/user.types";
import { flattenError } from "zod";
import { auth } from "../auth";
import { getCurrentServerSession } from "../session/server";

export async function updateNotificationSetting(
  formState: FormState,
  formData: FormData,
): Promise<FormState> {
  // const data = Object.fromEntries(formData);
  const userId = formData.get("userId") as string;
  const notificationStatusRaw = formData.get("notificationStatus");
  const notificationStatus = notificationStatusRaw === "on";
  const data = {
    userId,
    notificationStatus,
  };
  const validateField = notificationSettingSchema.safeParse(data);
  // const session = await auth.api.getSession({ headers: await head() });

  if (!validateField.success) {
    return {
      message: {
        error: "Invalid form data.",
      },
      errors: validateField.error.issues,
      errorMessage: flattenError(validateField.error).fieldErrors,
    };
  }

  if (!hasServerPermission("user", "update")) {
    throw new APIError("NOT_ACCEPTABLE", {
      message: "You don't have permission to perform this action",
    });
  }

  try {
    const updatedSetting = await db.user.update({
      where: { id: validateField.data.userId },
      data: {
        notificationStatus: validateField.data.notificationStatus,
      },
      select: {
        email: true,
        notificationStatus: true,
        notifications: true,
      },
    });
    console.log("updatedSettingNotification: ", updatedSetting);
  } catch (error) {
    if (error instanceof APIError) {
      console.log(error.message, error.body?.code);
      const errorCode = error.body?.code as ErrorTypes;
      switch (errorCode) {
        case errorCode:
          return {
            message: {
              error: error.message,
            },
          };
        default:
          return {
            message: {
              error: "Something went wrong.",
            },
          };
      }
    }
    throw error;
  }

  revalidatePath("/dashboard/settings", "page");

  return {
    message: {
      success: "Notification Setting Updated!",
    },
  };
}
