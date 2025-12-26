"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { headers as head } from "next/headers";
import { createAppSchema } from "./app.schema";
import { ActionState } from "../feedback/feedback.types";
import { toAction, toActionState } from "../feedback/feedback.utils";
import { getCurrentUser } from "../user/user.utils";
import { hasServerPermission } from "../permissions/permissions.actions";
import { APIError } from "better-auth/api";
import { createAppData } from "./app.utils";
import { ErrorTypes } from "../user/user.actions";

export async function createApp(
  formState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const validatedFields = createAppSchema.safeParse(data);
  if (!validatedFields.success) {
    return toAction(validatedFields.error, "ERROR");
  }

  const { name, organizationId, slug, description, logo } =
    validatedFields.data;

  const { session } = await getCurrentUser();

  try {
    if (!hasServerPermission("apps", "create")) {
      return toActionState(
        "You don't have permission to perform this action",
        "ERROR"
      );
    }

    const validation = await createAppData({
      name,
      slug,
      description,
      logo,
      organizationId: session.activeOrganizationId || organizationId,
    });
    console.log("validation App: ", validation);
  } catch (error) {
    if (error instanceof APIError) {
      console.log(error.message, error.body?.code);
      const errorCode = error.body?.code as ErrorTypes;
      switch (errorCode) {
        case errorCode:
          return toActionState(error.message, "ERROR");
        default:
          return toActionState("Something went wrong.", "ERROR");
      }
    }
    throw error;
  }

  revalidatePath("/dashboard/apps");

  return toActionState("App created successfully!", "SUCCESS");
}
