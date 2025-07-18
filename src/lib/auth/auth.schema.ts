import z, { TypeOf } from "zod";

export const signInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(3, "Password must be at least 3 characters"),
});

export const passwordSchema = z.object({
  password: z
    .string({
      required_error: "Le mot de passe est requis",
      invalid_type_error: "Le mot de passe est requis",
    })
    .min(5, "Le mot de passe doit contenir plus de 5 caractères")
    .max(32, "Le mot de passe doit contenir moins de 32 caractères"),
});

export const createUserSchema = z
  .object({
    name: z
      .string({
        required_error: "Le nom est requis",
        invalid_type_error: "Le nom est requis",
      })
      .trim()
      .min(3, "Le Nom est requis"),
    email: z
      .string({
        required_error: "L'email est requis",
        invalid_type_error: "L'email est requis",
      })
      .trim()
      .min(1, "L'email est requis")
      .email("Email invalide"),
    password: z
      .string({
        required_error: "Le mot de passe est requis",
        invalid_type_error: "Le mot de passe est requis",
      })
      .min(5, "Le mot de passe doit contenir plus de 5 caractères"),
    // .max(32, "Le mot de passe doit contenir moins de 32 caractères"),
    passwordConfirm: z
      .string({
        required_error: "Veuillez confirmer votre mot de passe",
        invalid_type_error: "Veuillez confirmer votre mot de passe",
      })
      .min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Les mots de passe ne correspondent pas",
  });

export const resetPasswordSchema = z.object({
  email: z
    .string({ required_error: "L'email est requis" })
    .email("Email invalide"),
});

export const newPasswordSchema = z
  .object({
    password: z
      .string({ required_error: "Le mot de passe est requis" })
      .min(8, "Le mot de passe doit contenir plus de 8 caractères"),
    passwordConfirm: z
      .string({ required_error: "Veuillez confirmer votre mot de passe" })
      .min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Les mots de passe ne correspondent pas",
  });

export const twoFactorSchema = z.object({
  code: z
    .string({ message: "Code is required" })
    .min(6, { message: "It requires minimum 6 characters" })
    .max(6, { message: "Code should not exceed 6 characters" })
    .regex(/^\d{6}$/, { message: "Code must be exactly 6 numeric digits" }),
});

export type SignInSchema = TypeOf<typeof signInSchema>;
export type PasswordSchema = TypeOf<typeof passwordSchema>;
export type PasswordSchemaErrors = z.inferFlattenedErrors<
  typeof passwordSchema
>;
export type CreateUserSchema = TypeOf<typeof createUserSchema>;
export type CreateUserErrors = z.inferFlattenedErrors<typeof createUserSchema>;
export type TwoFactorSchema = TypeOf<typeof twoFactorSchema>;
