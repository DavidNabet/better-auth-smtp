import { db } from "@/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ActionState } from "./feedback.types";

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
    {} as Record<string, typeof feedback.comments>
  );

  return { feedback, topLevel, repliesByParent };
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
      },
    });
    return feedbacks;
  } catch (error) {
    console.log(error);
  }
};

export type allFeedbackProps = Awaited<ReturnType<typeof allFeedback>>;

export const toActionState = (
  message: string,
  status: "SUCCESS" | "ERROR"
): ActionState => {
  return { message, status };
};

export const toAction = (
  errors: string | z.ZodError<any>,
  status: "SUCCESS" | "ERROR"
): ActionState => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  if (typeof (errors as unknown) === "string") {
    return { message: errors as unknown as string, status: "ERROR" };
  }

  const zodError = errors as z.ZodError<any>;

  return {
    status: "ERROR",
    message:
      status === "ERROR"
        ? "Veuillez corriger les erreurs du formulaire"
        : undefined,
    errors: zodError.issues,
    errorMessage: zodError.flatten().fieldErrors,
  };
};
