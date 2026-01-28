"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { headers as head } from "next/headers";
import {
  InviteSchema,
  inviteSchema,
} from "@/lib/organization/organization.schema";
import { ActionState } from "../feedback/feedback.types";
import { toAction, toActionState } from "../feedback/feedback.utils";
import { getCurrentUser } from "../user/user.utils";
import { hasServerPermission } from "../permissions/permissions.actions";
import { APIError } from "better-auth/api";
import { ErrorTypes } from "../user/user.actions";

export async function inviteMember(
  formState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const validatedFields = inviteSchema.safeParse(data);
  if (!validatedFields.success) {
    return toAction(validatedFields.error, "ERROR");
  }

  const { email, organizationId, role } = validatedFields.data;

  // const { session } = await getCurrentUser();

  try {
    if (!hasServerPermission("invitation", "create")) {
      return toActionState(
        "You don't have permission to perform this action",
        "ERROR",
      );
    }
    const invitation = await auth.api.createInvitation({
      body: {
        email,
        role,
        organizationId,
      },
      headers: await head(),
    });
    console.log("invitation: ", invitation);
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

  //   revalidatePath("/dashboard/apps");

  return toActionState("Invitation sent to member", "SUCCESS");
}
