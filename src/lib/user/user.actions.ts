"use server";

import { authServer } from "@/lib/auth/auth.client";
import { auth } from "@/lib/auth";
import { ZodError, ZodErrorMap, ZodFormattedError, ZodIssue } from "zod";
import {
  CreateUsersSchema,
  createUsersSchema,
  updateProfileSchema,
} from "@/lib/user/user.schema";
import { z } from "zod";
import { APIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers as head } from "next/headers";
import { Role } from "@prisma/client";
import { db } from "@/db";
import { redirect } from "next/navigation";
import { uploadFile } from "@/lib/upload";

export interface FormState {
  message: {
    error?: string;
    success?: string;
  };
  header?: any;
  errors?: ZodIssue[];
  errorMessage?: z.inferFlattenedErrors<z.ZodTypeAny>["fieldErrors"];
  // message: any;
  // data?: CreateUserSchema;
  // errors?: CreateUserErrors;
}

export type ErrorTypes = keyof typeof authServer.$ERROR_CODES;

export async function updateProfile(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData);
  const validatedFields = updateProfileSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      message: {
        error: "Invalid form data.",
      },
      errors: validatedFields.error.issues,
      errorMessage: validatedFields.error.flatten().fieldErrors,
    };
  }
  let upload;

  const { name, image } = validatedFields.data;
  if (image && image.size !== 0) {
    upload = await uploadFile(image);
    console.log("url: ", upload);
  }

  try {
    // const authContext = await auth.$context;
    // console.log("authContext: ", authContext);
    // await authContext.internalAdapter.updateUser(userId, {name, image})
    const { status } = await auth.api.updateUser({
      body: {
        name,
        image: upload?.url,
      },
      headers: await head(),
    });
    console.log("status: ", status);
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

  revalidatePath("/dashboard", "layout");
  // redirect("/dashboard");

  return {
    message: {
      success: "Profile updated successfully!",
    },
  };
}

const FormSchema = z.object({
  userId: z.string(),
});

export async function createUsers(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const validateField = FormSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!validateField.success) {
    return {
      message: {
        error: "Invalid form data.",
      },
      errorMessage: validateField.error.flatten().fieldErrors,
    };
  }
  const { userId } = validateField.data;

  const USER_EMAILS = process.env.USER_EMAILS?.split(";") || [];
  const isUsersExisted = await db.user.findMany({
    where: {
      id: userId,
      email: {
        in: USER_EMAILS,
      },
    },
  });
  if (isUsersExisted.length > 0) {
    return {
      message: {
        error: "Users already existed.",
      },
    };
  }
  // const { name, email, password, role } = validatedFields.data;

  try {
    // console.log("headers: ", headers);
    // console.log("response: ", response);

    const users = await Promise.all(
      USER_EMAILS.map(async (email, idx) => {
        const { user } = await auth.api.createUser({
          body: {
            name: email.split("@")[0],
            email,
            password: "superpassword",
            role: Role.USER,
          },
          headers: await head(),
        });
      })
    );
    console.log(users);
  } catch (error) {
    if (error instanceof APIError) {
      console.log(error);
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

  revalidatePath("/dashboard", "layout");

  return {
    message: {
      success: "Users added successfully!",
    },
  };
}
