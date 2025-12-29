import z, { TypeOf } from "zod";

// Name, slug, description, logo, organization
export const createAppSchema = z.object({
  name: z
    .string({ required_error: "The name is required" })
    .min(1, "The app name is required")
    .max(50, "The app name must be at most 50 characters"),
  // Slug: my-org
  slug: z
    .string({ required_error: "The slug is required" })
    .min(3, "The slug must be at least 3 characters")
    .transform((val, ctx) => {
      const c = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-/, "")
        .replace(/-$/, "");

      const regex = new RegExp(`^${c}$`);
      if (!regex.test(c)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid slug, it must be an iphen between the words",
        });
        return z.NEVER;
      }
      return c;
    }),

  description: z
    .string({ required_error: "The description is required" })
    .min(3, "The description must be at least 3 characters")
    .optional(),

  logo: z
    .instanceof(File)
    .refine((file) => file && file.size <= 3000000, "Max file size is 3MB.")
    .optional(),

  organizationId: z.string().min(1, "Org Id is required"),
});

export type CreateAppSchema = TypeOf<typeof createAppSchema>;
