import z, { TypeOf } from "zod";

// Name, slug, description, logo, organization
export const inviteSchema = z.object({
  email: z
    .email({
      pattern: z.regexes.email,
      error: "Entrer une adresse mail valide",
    })
    .trim()
    .min(1, "L'email est requis"),

  role: z.enum(["owner", "admin", "member"] as const).default("member"),

  organizationId: z.string().min(1, "Org Id is required").optional(),
});

export const createTeamSchema = z.object({
  organizationId: z.string().min(1, "Org Id is required"),
  name: z.string().trim().min(1, "Le nom de la team est requis"),
  description: z.string().trim().max(150).optional(),
});

export type InviteSchema = TypeOf<typeof inviteSchema>;
export type CreateTeamSchema = TypeOf<typeof createTeamSchema>;
