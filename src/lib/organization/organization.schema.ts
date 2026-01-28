import z, { TypeOf } from "zod";

// Name, slug, description, logo, organization
export const inviteSchema = z.object({
  email: z
    .string({ required_error: "Ce champ est requis" })
    .min(1, "L'email is required")
    .trim()
    .email("Entrer une adresse mail valide"),

  role: z.enum(["owner", "admin", "member"]).default("member"),

  organizationId: z.string().min(1, "Org Id is required").optional(),
});

export type InviteSchema = TypeOf<typeof inviteSchema>;
