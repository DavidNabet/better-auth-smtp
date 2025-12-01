import z, { TypeOf } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(30, "Le nom doit contenir au maximum 30 caractères")
    .trim()
    .optional()
    .or(z.literal("")),
  image: z
    .instanceof(File)
    .refine((file) => file && file.size <= 3000000, "Max file size is 3MB.")
    .optional(),
  avatar: z.string().url("Must be an url").optional().or(z.literal("")),
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
    revokeOtherSessions: z.boolean(),
    currentPassword: z
      .string({
        required_error: "Le mot de passe est requis",
        invalid_type_error: "Le mot de passe est requis",
      })
      .min(5, "Le mot de passe doit contenir plus de 5 caractères")
      .max(32, "Le mot de passe doit contenir moins de 32 caractères"),
    newPassword: z
      .string({
        required_error: "Le mot de passe est requis",
        invalid_type_error: "Le mot de passe est requis",
      })
      .min(5, "Le mot de passe doit contenir plus de 5 caractères")
      .max(32, "Le mot de passe doit contenir moins de 32 caractères"),
    newPasswordConfirm: z
      .string({
        required_error: "Veuillez confirmer votre mot de passe",
        invalid_type_error: "Veuillez confirmer votre mot de passe",
      })
      .min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
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

  role: z.enum(["ADMIN", "MEMBER", "USER"]).default("USER"),
});

export const updateUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(30, "Name must be at most 30 characters")
    .nullable(),

  role: z.enum(["ADMIN", "MEMBER", "USER"]),
  // banned: z.boolean().optional(),
  // twoFactorEnabled: z.boolean().optional(),
});

export type UpdateProfileSchema = TypeOf<typeof updateProfileSchema>;
export type UpdateEmailSchema = TypeOf<typeof updateEmailSchema>;
export type UpdatePasswordSchema = TypeOf<typeof updatePasswordSchema>;
export type CreateUsersSchema = TypeOf<typeof createUsersSchema>;
export type UpdateUserSchema = TypeOf<typeof updateUserSchema>;
