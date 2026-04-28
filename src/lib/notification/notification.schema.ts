import { z } from "zod";

const notificationTypeSchema = z.enum([
  "mention",
  "member_joined",
  "invitation_pending",
  "system",
  "info",
  "user_created",
]);

export const notificationSchema = z.object({
  type: notificationTypeSchema,
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(30, "Le titre doit contenir au maximum 30 caractères")
    .trim(),
  message: z
    .string()
    .min(1, "Le message est requis")
    .max(400, "Le message doit contenir 400 caractères au maximum"),
  link: z.url({ protocol: /^http?$/, hostname: z.regexes.domain }),
  userId: z.string(),
  read: z.boolean(),
  expiresAt: z.iso.datetime(),
});
