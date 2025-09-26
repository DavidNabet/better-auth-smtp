import { db } from "@/db";

export const getFeedbackByTitle = async (title: string) => {
  try {
    const feedback = await db.feedback.findFirstOrThrow({
      where: { title },
    });
    return feedback;
  } catch (error) {
    console.log(error);
  }
};
