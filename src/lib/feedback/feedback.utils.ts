import { db } from "@/db";
import { Prisma } from "@prisma/client";

export const getOptions = <Prisma.FeedbackInclude>{
  votes: true,
  comments: {
    include: { user: true },
    orderBy: { createdAt: "desc" },
  },
  author: {
    select: {
      name: true,
      image: true,
      role: true,
    },
  },
};
export type PrismaOptions = Prisma.FeedbackGetPayload<{
  include: typeof getOptions;
}>;

export const getFeedbackByTitle = async (title: string) => {
  try {
    const feedback = await db.feedback.findFirst({
      where: { title },
      include: getOptions,
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
