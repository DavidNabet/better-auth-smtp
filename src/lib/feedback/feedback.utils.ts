import { db } from "@/db";
import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

// export type PrismaOptions = Prisma.FeedbackInclude<DefaultArgs>;

export const getFeedbackByTitle = async (title: string) => {
  try {
    const feedback = await db.feedback.findFirstOrThrow({
      where: { title },
    });
    if (!feedback) throw new Error("Feedback not exist");
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
