"use server";

import { authServer } from "@/lib/auth/auth.client";
import { auth } from "@/lib/auth";
import { typeToFlattenedError, ZodError, ZodIssue } from "zod";
import { getUserByEmail } from "@/lib/user/user.utils";
import { createUserSchema, signInSchema } from "./auth.schema";
import { APIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export interface FormState {
  message: {
    error?: string;
    success?: string;
  };
  header?: any;
  errors?: ZodIssue[];
  errorMessage?: any;
  otpReceive?: boolean;
  // message: any;
  // data?: CreateUserSchema;
  // errors?: CreateUserErrors;
}

type ErrorTypes = keyof typeof authServer.$ERROR_CODES;

export async function signIn(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData);
  const validatedFields = signInSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      message: {
        error: "Missing fields. Failed to log in.",
      },
      errors: validatedFields.error.issues,
      errorMessage: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  try {
    const { headers: header, response } = await auth.api.signInEmail({
      returnHeaders: true,
      body: {
        email,
        password,
      },
      headers: {
        "Content-Type": "application/json",
        cookie: (await headers()).get("cookie") ?? "",
      },
    });
    console.log("headerAction: ", header);
    console.log("Response: ", response);
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
  redirect("/dashboard");

  // return {
  //   message: {
  //     success: "Successfully sign in",
  //   },
  // };
}

export async function signUp(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData);
  const validatedFields = createUserSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: {
        error: "Missing fields. Failed to create account.",
      },
      errors: validatedFields.error.issues,
      errorMessage: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  const existingEmailUser = await getUserByEmail(email);

  if (existingEmailUser) {
    return {
      message: {
        error: "Email already exists",
      },
    };
  }

  try {
    const response = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: {
        "Content-Type": "application/json",
        cookie: (await headers()).get("cookie") ?? "",
      },
      asResponse: true,
    });
    console.log("Response: ", response);
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
  redirect("/dashboard");

  // return {
  //   message: {
  //     success: "Successfully signed up",
  //   },
  // };
}
