"use server";

import { authServer } from "@/lib/auth/auth.client";
import { auth } from "@/lib/auth";
import { ZodError, ZodErrorMap, ZodFormattedError, ZodIssue } from "zod";
import {
  CreateUsersSchema,
  createUsersSchema,
  updatePasswordSchema,
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
import { User } from "better-auth";
import { getUserById } from "../auth/auth.utils";

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

  const { name, image, avatar } = validatedFields.data;
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
        image: upload?.url || avatar,
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
  userId: z.string().min(1, "User ID is required"),
  banReason: z.string().optional(),
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
  if (isUsersExisted.length === USER_EMAILS.length) {
    return {
      message: {
        error: "Users already existed.",
      },
    };
  }
  // const { name, email, password, role } = validatedFields.data;
  // TODO : Trouver comment faire un compteur pour chaque user créé à partir de USER_EMAILS
  // TODO : Puis décrémenter à chaque fois qu'on génere un user avec une quantité (Exemple du panier à l'envers)

  try {
    // console.log("response: ", response);

    const users = await Promise.allSettled(
      USER_EMAILS.map(async (email, idx) => {
        return await auth.api.createUser({
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
    console.log("users: ", users);
    // after create users sendEmailLogin
  } catch (error) {
    if (error instanceof APIError) {
      console.log("Error creating users:", error);
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

export async function updateUser(schema: UpdateUserSchema): Promise<{
  success: boolean;
  message: string;
  user?: User;
}> {
  try {
    // Validate the input data
    const validatedFields = updateUserSchema.safeParse(schema);
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

    // Only admins and moderators can update other users, or users can update themselves
    const isNotUser = session.user.role !== "USER";
    const isSelfUpdate = session.user.id === userId;

    if (!isNotUser && !isSelfUpdate) {
      return {
        success: false,
        message: "Insufficient permissions.",
      };
    }

    // Prevent non-role user from changing role or banned status
    if (!isNotUser && updateData.role) {
      return {
        success: false,
        message: "Only admins can change role or ban status.",
      };
    }

    // Update user using better-auth's internal adapter
    const authContext = await auth.$context;
    const { user } = await auth.api.setRole({
      body: {
        userId,
        role: updateData.role,
      },
      headers: await head(),
    });

    console.log("SERVER ACTION UPDATE USER: ", updateData);

    // Optionally, update other fields like name or image
    if (updateData.name) {
      await authContext.internalAdapter.updateUser(userId, {
        name: updateData.name,
      });

      // invalidating cache
      await auth.api.listUserSessions({
        body: {
          userId,
        },
        headers: await head(),
      });
    }

    // Revalidate the dashboard to refresh the table data
    revalidatePath("/dashboard");
    // revalidatePath("/dashboard/admin", "page");

    return {
      success: true,
      message: "User updated successfully!",
      user,
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

export async function banUser(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = FormSchema.safeParse({
    userId: formData.get("userId"),
    banReason: formData.get("banReason"),
  });

  if (!validatedFields.success) {
    return {
      message: {
        error: "Invalid form data.",
      },
      errors: validatedFields.error.issues,
      errorMessage: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { userId, banReason } = validatedFields.data;
  const isUser = await getUserById(userId);
  if (!isUser) {
    return {
      message: {
        error: "The user does not exist.",
      },
    };
  }

  try {
    const { user } = await auth.api.banUser({
      body: {
        userId,
        banReason,
        banExpiresIn: 60 * 60 * 24 * 7,
      },
      headers: await head(),
    });
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

  return {
    message: {
      success: "User banned successfully!",
    },
  };
}

export async function deleteUser(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData);
  const validatedFields = FormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: {
        error: "Invalid form data.",
      },
      errors: validatedFields.error.issues,
      errorMessage: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { userId } = validatedFields.data;

  const isUser = await getUserById(userId);
  if (!isUser) {
    return {
      message: {
        error: "The user does not exist.",
      },
    };
  }

  try {
    const { success } = await auth.api.removeUser({
      body: {
        userId: isUser.id,
      },
      headers: await head(),
    });
    console.log("Is the user deleted ? :", success);
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

  // Revalidate the dashboard to refresh the table data
  revalidatePath("/dashboard", "layout");

  return {
    message: {
      success: "User deleted successfully!",
    },
  };
}

export async function updateUserPassword(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData);
  const validatedFields = updatePasswordSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      message: {
        error: "Invalid form data.",
      },
      errors: validatedFields.error.issues,
      errorMessage: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword, revokeOtherSessions } =
    validatedFields.data;

  try {
    const { user, token } = await auth.api.changePassword({
      body: {
        newPassword,
        currentPassword,
        revokeOtherSessions,
      },
      headers: await head(),
    });
    console.log("user: ", user, "token: ", token);
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

  revalidatePath("/dashboard/settings/security", "page");

  return {
    message: {
      success: "Password updated successfully!",
    },
  };
}
