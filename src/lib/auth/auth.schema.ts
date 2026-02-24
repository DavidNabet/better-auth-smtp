import z, { TypeOf } from "zod";

export const signInSchema = z.object({
  email: z
    .email({ message: "L'email est mal orthographié" })
    .min(1, "Email is required"),
  password: z
    .string({ error: "Le mot de passe est requis" })
    .min(3, "Le mot de passe doit contenir plus de 3 caractères")
    .max(32, "Le mot de passe doit contenir moins de 32 caractères"),
});

export const passwordSchema = z.object({
  password: z
    .string({
      error: "Le mot de passe est requis",
    })
    .min(5, "Le mot de passe doit contenir plus de 5 caractères")
    .max(32, "Le mot de passe doit contenir moins de 32 caractères"),
});

export const createUserSchema = z
  .object({
    name: z
      .string({
        error: "Le nom est requis",
      })
      .trim()
      .min(3, "Le Nom est requis"),
    email: z.email().trim().min(1, "L'email est requis"),
    password: z
      .string({
        error: "Le mot de passe est requis",
      })
      .min(5, "Le mot de passe doit contenir plus de 5 caractères"),
    // .max(32, "Le mot de passe doit contenir moins de 32 caractères"),
    passwordConfirm: z
      .string({
        error: "Veuillez confirmer votre mot de passe",
      })
      .min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    error: "Les mots de passe ne correspondent pas",
  });

export const resetPasswordSchema = z.object({
  email: z.email("Email invalide"),
});

export const newPasswordSchema = z
  .object({
    password: z
      .string({ error: "Le mot de passe est requis" })
      .min(8, "Le mot de passe doit contenir plus de 8 caractères"),
    passwordConfirm: z
      .string({ error: "Veuillez confirmer votre mot de passe" })
      .min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    error: "Les mots de passe ne correspondent pas",
  });

export const twoFactorSchema = z.object({
  code: z
    .string({ error: "Code is required" })
    .min(6, "It requires minimum 6 characters")
    .max(6, "Code should not exceed 6 characters")
    .regex(/^\d{6}$/, "Code must be exactly 6 numeric digits"),
});

export type SignInSchema = TypeOf<typeof signInSchema>;
export type PasswordSchema = TypeOf<typeof passwordSchema>;
export type PasswordSchemaErrors = z.core.$ZodFlattenedError<
  z.infer<typeof passwordSchema>
>;
export type CreateUserSchema = TypeOf<typeof createUserSchema>;
export type CreateUserErrors = z.core.$ZodFlattenedError<CreateUserSchema>;
export type SignInSchemaErrors = z.core.$ZodFlattenedError<SignInSchema>;
export type TwoFactorSchema = TypeOf<typeof twoFactorSchema>;
