import { APIError } from "better-auth/api";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { ErrorTypes, FormState } from "../user/user.actions";
import { createFeedbackSchema } from "@/lib/feedback/feedback.schema";

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

  const { title, description, status } = validatedFields.data;

  try {
    // const feedback = await db.feedback.create({
    //     data: {
    //         title: title ?? "",
    //         description,
    //         status,
    //     }
    // })
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

  revalidatePath("/dashboard/feedback", "layout");
  // redirect("/dashboard");

  return {
    message: {
      success: "Feedback created successfully!",
    },
  };
}
