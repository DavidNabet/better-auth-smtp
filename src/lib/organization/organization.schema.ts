import z, { TypeOf } from "zod";

// Name, slug, description, logo, organization
export const inviteSchema = z.object({
  email: z
    .email({
      pattern: z.regexes.email,
      error: "Entrer une adresse mail valide",
    })
    .min(1, "L'email est requis")
    .trim(),

  role: z.enum(["owner", "admin", "member"] as const).default("member"),

  organizationId: z.string().min(1, "Org Id is required").optional(),
});

export const createTeamSchema = z.object({
  organizationId: z.string().min(1, "Org Id is required"),
  name: z.string().min(1, "Le nom de la team est requis").trim().optional(),
  description: z
    .string()
    .min(3, "La description doit être supérieur à plus de 3 caractères")
    .optional(),
});

export type InviteSchema = TypeOf<typeof inviteSchema>;
export type CreateTeamSchema = TypeOf<typeof createTeamSchema>;
