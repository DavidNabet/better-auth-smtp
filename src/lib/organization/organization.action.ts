"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { headers as head } from "next/headers";
import {
  createTeamSchema,
  InviteSchema,
  inviteSchema,
} from "@/lib/organization/organization.schema";
import { ActionState } from "../feedback/feedback.types";
import { toAction, toActionState } from "../feedback/feedback.utils";
import { getCurrentUser } from "../user/user.utils";
import { hasServerOrgPermission } from "../permissions/permissions.actions";
import { APIError } from "better-auth/api";
import { ErrorTypes } from "../user/user.actions";
import z from "zod/v4";

export async function inviteMember(
  formState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const validatedFields = inviteSchema.safeParse(data);
  if (!validatedFields.success) {
    return toAction<typeof inviteSchema>(validatedFields.error, "ERROR");
  }

  const { email, organizationId, role } = validatedFields.data;

  // const { session } = await getCurrentUser();

  try {
    if (!hasServerOrgPermission("invitation", "create")) {
      return toActionState(
        "You don't have permission to perform this action",
        "ERROR",
      );
    }
    // const invitation = await auth.api.createInvitation({
    //   body: {
    //     email,
    //     role,
    //     organizationId,
    //   },
    //   headers: await head(),
    // });
    // console.log("invitation: ", invitation);
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

// TODO: Régler le problème de Zod pour récupérer le fieldErrors côté useActionState
export async function createTeam(
  formState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const validatedFields = createTeamSchema.safeParse(data);

  if (!validatedFields.success) {
    const { fieldErrors } = z.flattenError(validatedFields.error);
    console.log("error: ", fieldErrors);

    return toAction<typeof createTeamSchema>(validatedFields.error, "ERROR");
  }

  // const { name, organizationId, description } = validatedFields.data;

  // const { session } = await getCurrentUser();

  try {
    if (!hasServerOrgPermission("team", "create")) {
      return toActionState(
        "You don't have permission to perform this action",
        "ERROR",
      );
    }
    // const team = await auth.api.createTeam({
    //   body: {
    //     name,
    //     organizationId,
    //     description: description ?? undefined,
    //   },
    // });
    // console.log("team: ", team);
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

  return toActionState("Team created successfully!!!", "SUCCESS");
}
