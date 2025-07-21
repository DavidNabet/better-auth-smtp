import z, { TypeOf } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string({ required_error: "Le nom est requis" })
    .min(1, "Le nom est requis")
    .max(30, "Le nom doit contenir au maximum 30 caractères"),
  image: z
    .instanceof(File, { message: "Please select an image" })
    .nullable()
    .refine((file) => file && file.size <= 3000000, "Max file size is 3MB."),
});

export const updateEmailSchema = z.object({
  email: z
    .string({
      required_error: "L'email est requis",
      invalid_type_error: "L'email est invalide",
    })
    .min(1, "L'email est requis")
    .email("Email invalide"),
});

export const updatePasswordSchema = z
  .object({
    revokeOtherSessions: z.boolean().optional(),
    password: z
      .string({
        required_error: "Le mot de passe est requis",
        invalid_type_error: "Le mot de passe est requis",
      })
      .min(5, "Le mot de passe doit contenir plus de 5 caractères")
      .max(32, "Le mot de passe doit contenir moins de 32 caractères"),
    currentPassword: z
      .string({
        required_error: "Le mot de passe est requis",
        invalid_type_error: "Le mot de passe est requis",
      })
      .min(5, "Le mot de passe doit contenir plus de 5 caractères")
      .max(32, "Le mot de passe doit contenir moins de 32 caractères"),
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

export const createUsersSchema = z.object({
  name: z
    .string({ required_error: "Le nom est requis" })
    .min(1, "Le nom est requis")
    .max(30, "Le nom doit contenir au maximum 30 caractères"),
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
    .min(5, "Le mot de passe doit contenir plus de 5 caractères")
    .max(32, "Le mot de passe doit contenir moins de 32 caractères"),

  role: z.enum(["ADMIN", "USER"]).default("USER"),
});

export type UpdateProfileSchema = TypeOf<typeof updateProfileSchema>;
export type UpdateEmailSchema = TypeOf<typeof updateEmailSchema>;
export type UpdatePasswordSchema = TypeOf<typeof updatePasswordSchema>;
export type CreateUsersSchema = TypeOf<typeof createUsersSchema>;
