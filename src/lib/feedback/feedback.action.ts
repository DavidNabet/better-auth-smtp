"use server";

import { APIError } from "better-auth/api";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { headers as head } from "next/headers";
import { auth } from "../auth";
import type { ErrorTypes } from "../user/user.actions";
import {
  createCommentSchema,
  createFeedbackSchema,
} from "@/lib/feedback/feedback.schema";
import { getUserIdByEmail } from "../auth/auth.utils";
import {
  getFeedbackTitleById,
  toAction,
  toActionState,
} from "./feedback.utils";
import type { ActionState, State } from "./feedback.types";
import type { FormState } from "../user/user.types";
import { z } from "zod";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";

export async function createFeedback(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData);
  const validatedFields = createFeedbackSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      message: {
        error: "Invalid form data.",
      },
      errors: validatedFields.error.issues,
      errorMessage: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, description, subject } = validatedFields.data;

  try {
    const session = await auth.api.getSession({
      headers: await head(),
    });

    if (!session?.user) {
      return {
        message: {
          error: "Unauthorized.",
        },
      };
    }
    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      return {
        message: {
          error: "User not found",
        },
      };
    }

    const feedback = await db.feedback.create({
      data: {
        title,
        description,
        status: "PENDING",
        subject,
        authorId: userId,
      },
      select: {
        id: true,
        authorId: true,
      },
    });
    console.log("feedback: ", feedback);
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

  revalidatePath("/dashboard/feedbacks");
  // redirect("/dashboard");

  return {
    message: {
      success: "Feedback created successfully!",
    },
  };
}
export async function addComment(
  formState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const validatedFields = createCommentSchema.safeParse(data);
  if (!validatedFields.success) {
    return toAction(validatedFields.error, "ERROR");
  }

  const { content, feedbackId } = validatedFields.data;

  const slug = await getFeedbackTitleById(feedbackId);

  try {
    const session = await auth.api.getSession({
      headers: await head(),
    });

    if (!session?.user) {
      return toActionState("Unauthorized", "ERROR");
    }
    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      return toActionState("User not found", "ERROR");
    }

    const comment = await db.comment.create({
      data: {
        content,
        userId,
        feedbackId,
      },
      select: {
        id: true,
        feedbackId: true,
      },
    });
    console.log("feedback Comment: ", comment);
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

  revalidatePath(`/dashboard/feedback/${slug}`);
  // redirect("/dashboard");

  return toActionState("Comment created successfully!", "SUCCESS");
}

export async function toggleVote(feedbackId: string, type: "UP" | "DOWN") {
  const session = await auth.api.getSession({
    headers: await head(),
  });
  if (!session?.user.id) {
    return {
      message: {
        error: "Unauthorized.",
      },
    };
  }

  const existing = await db.vote.findUnique({
    where: {
      userId_feedbackId: {
        feedbackId: feedbackId,
        userId: session.user.id,
      },
    },
  });

  if (existing) {
    if (existing.type === type) {
      // Supprimer l'upvote (toggle off)
      await db.vote.delete({
        where: {
          id: existing.id,
        },
      });
      return { status: "removed", type };
    } else {
      // Vote différent -> mise à jour
      await db.vote.update({
        where: { id: existing.id },
        data: { type },
      });
      return { status: "updated", type };
    }
  } else {
    // Pas encore voté -> création
    await db.vote.create({
      data: {
        feedbackId,
        userId: session.user.id,
        type,
      },
    });
    return { status: "added", type };
  }
}

export async function toggleLike(formState: ActionState, formData: FormData) {
  const data = Object.fromEntries(formData);
  const validatedFields = z.object({ commentId: z.string() }).safeParse(data);
  if (!validatedFields.success) {
    return toAction(validatedFields.error, "ERROR");
  }

  const { commentId } = validatedFields.data;

  const session = await auth.api.getSession({
    headers: await head(),
  });

  if (!session?.user) {
    return toActionState("Non authentifié", "ERROR");
  }

  const userId = session.user.id;

  try {
    const existing = await db.like.findUnique({
      where: {
        userId_commentId: { userId, commentId },
      },
    });
    if (existing) {
      await db.like.delete({ where: { id: existing.id } });
    } else {
      await db.like.create({
        data: { userId, commentId },
      });
    }
  } catch (error) {
    console.log(error);
    if (error instanceof PrismaClientValidationError) {
      console.log(error.message, error.cause);
      return toActionState(error.message, "ERROR");
    }
    throw error;
  }
  return toActionState("Like updated!", "SUCCESS");

  // const parentComment = await db.comment.findUnique({
  //   where: { id: commentId },
  //   select: { feedbackId: true },
  // });

  // if (parentComment) {
  //   revalidatePath(`/feedbacks/${parentComment.feedbackId}`);
  // }
}
