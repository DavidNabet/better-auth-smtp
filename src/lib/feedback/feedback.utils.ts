import { db } from "@/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  ActionState,
  CommentWithRelations,
  FieldErrors,
} from "./feedback.types";

export const getOptions = Prisma.validator<Prisma.FeedbackInclude>()({
  votes: true,
  comments: {
    include: {
      user: {
        select: {
          image: true,
          id: true,
          email: true,
          name: true,
        },
      },
      likes: true,
    },
    orderBy: { createdAt: "desc" },
  },
  author: {
    select: {
      name: true,
      image: true,
      role: true,
    },
  },
});
export type PrismaOptions = Prisma.FeedbackGetPayload<{
  include: typeof getOptions;
}>;
export const getFeedbackByTitle = async (title: string) => {
  try {
    const feedback = await db.feedback.findFirst({
      where: { title },
      include: getOptions,
    });
    // if (!feedback) throw new Error("Feedback not exist");
    return feedback;
  } catch (error) {
    console.log(error);
  }
};

export const getFeedbackTitleById = async (feedbackId: string) => {
  try {
    const feedback = await db.feedback.findUnique({
      where: { id: feedbackId },
    });
    return feedback?.title;
  } catch (error) {
    console.log(error);
  }
};
export const getFeedbackTitleByCommentId = async (commentId: string) => {
  try {
    const comment = await db.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        feedback: {
          select: {
            title: true,
          },
        },
      },
    });
    return comment?.feedback?.title;
  } catch (error) {
    console.log(error);
  }
};

export async function getFeedbackWithComments(title: string) {
  const feedback = await db.feedback.findFirstOrThrow({
    where: { title: { equals: title } },
    include: getOptions,
  });

  if (!feedback) return null;

  // Tri et regroupement
  const topLevel = feedback.comments.filter((c) => !c.parentId);
  const repliesByParent = feedback.comments.reduce(
    (acc, c) => {
      if (c.parentId) {
        acc[c.parentId] = acc[c.parentId] || [];
        acc[c.parentId].push(c);
      }
      return acc;
    },
    {} as Record<string, typeof feedback.comments>,
  );

  return { feedback, topLevel, repliesByParent };
}

/**
 * Nettoie les parentId orphelins dans la table comment:
 * 1. parentId est dit "orphelin" lorsqu'il fait référence à un commentaire qui n'existe plus
 * 2. Cette fonction met parentId = null pour ces commentaires.
 *
 * @returns corrected: nombre de commentaires corrigés (parentId mis à null)
 * @returns orphanIds: liste des parentId qui ne correspondent à aucun commentaire existant
 */
export async function cleanupOrphanCommentParents(): Promise<{
  corrected: number;
  orphanIds: string[];
}> {
  const existing = await db.comment.findMany({
    select: { id: true, parentId: true },
  });

  const existingIds = new Set(existing.map((c) => c.id));
  const parentIds = existing
    .map((c) => c.parentId!)
    .filter((id) => !!id && id?.length > 0);

  const orphanIds = Array.from(
    new Set(parentIds.filter((pid) => !existingIds.has(pid))),
  );

  if (orphanIds.length === 0) {
    return { corrected: 0, orphanIds: [] };
  }

  const updateResult = await db.comment.updateMany({
    where: { parentId: { in: orphanIds } },
    data: { parentId: null },
  });

  return {
    corrected: updateResult.count,
    orphanIds: orphanIds,
  };
}

export const allFeedback = async () => {
  try {
    const feedbacks = await db.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        subject: true,
        description: true,
        votes: true,
        updatedAt: true,
        authorId: true,
        comments: {
          include: {
            likes: true,
            user: {
              select: { image: true, id: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        app: {
          select: {
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    });
    return feedbacks;
  } catch (error) {
    console.log(error);
  }
};

export type allFeedbackProps = Awaited<ReturnType<typeof allFeedback>>;

export async function getCommentsTree(feedbackId: string) {
  const comments = await db.comment.findMany({
    where: { feedbackId },
    include: {
      user: true,
      likes: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const map = new Map<string, CommentWithRelations>();
  const roots: CommentWithRelations[] = [];

  // Init
  comments.forEach((c) => map.set(c.id, { ...c, replies: [] }));

  // Lie les enfants à leurs parents
  comments.forEach((c) => {
    if (c.parentId) {
      const parent = map.get(c.parentId);
      if (parent) parent?.replies?.push(map.get(c.id)!);
    } else {
      roots.push(map.get(c.id)!);
    }
  });

  return { roots, comments };
}

export const toActionState = (
  message: string,
  status: "SUCCESS" | "ERROR",
): ActionState => {
  return { message, status };
};

/**
 * Convertit une erreur (string ou ZodError) en ActionState standardisé.
 * - Accepte n'importe quel schéma Zod via un type générique.
 * - Utilise z.flattenError(zodError) (recommandé Zod v4) pour obtenir fieldErrors.
 * - Aligne errorMessage sur FieldErrors pour la consommation côté UI.
 */
export const toAction = <S extends z.ZodType>(
  errors: string | z.ZodError<z.output<S>>,
  status: "SUCCESS" | "ERROR",
): ActionState => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  if (typeof (errors as unknown) === "string") {
    return { message: errors as unknown as string, status: "ERROR" };
  }

  const zodError = errors as z.ZodError<z.output<S>>;
  const { fieldErrors } = z.flattenError(zodError);
  console.log("ActionState fieldErrors: ", fieldErrors);

  return {
    status: "ERROR",
    message:
      status === "ERROR"
        ? "Veuillez corriger les erreurs du formulaire"
        : undefined,
    errors: zodError.issues,
    errorMessage: fieldErrors as FieldErrors<S>,
  };
};
