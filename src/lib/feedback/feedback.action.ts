"use server";

import { APIError } from "better-auth/api";
import { db } from "@/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers as head } from "next/headers";
import { auth } from "@/lib/auth";
import { requireModerator, type ErrorTypes } from "@/lib/user/user.actions";
import {
  createCommentSchema,
  createFeedbackSchema,
} from "@/lib/feedback/feedback.schema";
import {
  cleanupOrphanCommentParents,
  getFeedbackTitleByCommentId,
  getFeedbackTitleById,
  toAction,
  toActionState,
} from "./feedback.utils";
import type { ActionState, State } from "./feedback.types";
import type { FormState } from "@/lib/user/user.types";
import { decodeSlug, slugify } from "@/lib/utils";
import { hasServerPermission } from "@/lib/permissions/permissions.actions";
import { getUserIdByEmail } from "@/lib/user/user.utils";
import { getAppBySlug } from "../app/app.utils";

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

  const { title, description, subject, appId } = validatedFields.data;

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

    const app = await getAppBySlug(appId.toLowerCase());
    if (!app) {
      return {
        message: {
          error: "App must be valid",
        },
      };
    }

    if (!hasServerPermission("comments", "create-comment")) {
      throw new APIError("NOT_ACCEPTABLE", {
        message: "You don't have permission to perform this action",
      });
    }

    const feedback = await db.feedback.create({
      data: {
        title,
        description,
        status: "PENDING",
        subject,
        authorId: userId,
        appId: app.id,
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

  const { content, feedbackId, parentId } = validatedFields.data;

  const slug = (await getFeedbackTitleById(feedbackId)) ?? "";

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
        parentId: parentId ?? null,
      },
      select: {
        id: true,
        feedbackId: true,
        parentId: true,
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

  revalidatePath(`/dashboard/feedbacks/${slugify(slug)}`);
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
  const slug = (await getFeedbackTitleByCommentId(commentId)) ?? "";

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

  revalidatePath(`/dashboard/feedbacks/${slugify(slug)}`);
  return toActionState("Like updated!", "SUCCESS");
}

const CommentSchema = z.object({
  commentId: z.string().min(1, "User ID is required"),
});

// Supprimer complètement un commentaire
export async function deleteComment(
  formState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const validatedFields = CommentSchema.safeParse(data);
  if (!validatedFields.success) {
    return toAction(validatedFields.error, "ERROR");
  }

  const { commentId } = validatedFields.data;

  const slug = (await getFeedbackTitleByCommentId(commentId)) ?? "";

  const moderator = await requireModerator();
  if (!moderator) return toActionState("Modérateur introuvable", "ERROR");
  try {
    await db.moderationLog.create({
      data: {
        action: "DELETE_COMMENT",
        moderatorId: moderator.id,
      },
    });
    await db.comment.delete({
      where: { id: commentId },
    });
    await cleanupOrphanCommentParents();
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

  revalidatePath(`/dashboard/feedbacks/${slugify(slug)}`);

  return toActionState("Comment deleted successfully!", "SUCCESS");
}
// Masquer un commentaire
export async function toggleHideComment(
  formState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const validatedFields = CommentSchema.safeParse(data);
  if (!validatedFields.success) {
    return toAction(validatedFields.error, "ERROR");
  }

  const { commentId } = validatedFields.data;

  const slug = (await getFeedbackTitleByCommentId(commentId)) ?? "";

  const comment = await db.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) return toActionState("Commentaire introuvable", "ERROR");

  const isNowHidden = !comment.isHidden;

  const permission = await requireModerator();
  if (!permission)
    return toActionState(
      "You don't have the permission to do this action!",
      "ERROR"
    );
  try {
    await db.comment.update({
      where: { id: commentId },
      data: {
        isHidden: isNowHidden,
        content: isNowHidden
          ? "[Commentaire masqué par la modération]"
          : (comment.originalContent ?? "(commentaire restauré)"),
        originalContent: isNowHidden
          ? (comment.originalContent ?? comment.content)
          : null,
      },
    });

    await db.moderationLog.create({
      data: {
        action: "HIDE_COMMENT",
        commentId,
        moderatorId: permission?.id,
      },
    });
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

  revalidatePath(`/dashboard/feedbacks/${slugify(slug)}`);

  return toActionState("Comment hide successfully!", "SUCCESS");
}
