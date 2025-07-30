"use server";

import { authServer } from "@/lib/auth/auth.client";
import { auth } from "@/lib/auth";
import { ZodError, ZodErrorMap, ZodFormattedError, ZodIssue } from "zod";
import {
  CreateUsersSchema,
  createUsersSchema,
  updateProfileSchema,
  updateUserSchema,
  UpdateUserSchema,
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

export async function updateUser(data: UpdateUserSchema): Promise<{
  success: boolean;
  message: string;
  user?: any;
}> {
  try {
    // Validate the input data
    const validatedFields = updateUserSchema.safeParse(data);
    if (!validatedFields.success) {
      return {
        success: false,
        message: "Invalid form data.",
      };
    }

    const { userId, ...updateData } = validatedFields.data;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    // Check if current user has permission to update this user
    const session = await auth.api.getSession({
      headers: await head(),
    });

    if (!session?.user) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    // Only admins can update other users, or users can update themselves
    const isAdmin = session.user.role === "ADMIN";
    const isSelfUpdate = session.user.id === userId;

    if (!isAdmin && !isSelfUpdate) {
      return {
        success: false,
        message: "Insufficient permissions.",
      };
    }

    // Prevent non-admins from changing role or banned status
    if (!isAdmin && (updateData.role || updateData.banned !== undefined)) {
      return {
        success: false,
        message: "Only admins can change role or ban status.",
      };
    }

    // Update user using better-auth's internal adapter
    const authContext = await auth.$context;
    const updatedUser = await authContext.internalAdapter.updateUser(userId, updateData);

    // Revalidate the dashboard to refresh the table data
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/admin", "page");

    return {
      success: true,
      message: "User updated successfully!",
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    
    if (error instanceof APIError) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Something went wrong while updating the user.",
    };
  }
}
