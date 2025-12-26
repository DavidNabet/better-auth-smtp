import { z, TypeOf } from "zod";

export const createFeedbackSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(30, "Le titre doit contenir au maximum 30 caractères")
    .trim(),
  description: z
    .string()
    .min(1, "La description est requise")
    .max(400, "La description doit contenir 400 caractères au maximum"),
  subject: z
    .string()
    .min(1, "Le sujet est requis")
    .max(15, "Le sujet doit contenir au maximum 15 caractères"),
  status: z
    .enum(["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"])
    .default("PENDING"),

  appId: z.string().min(1, "App Id is required"),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu est requis")
    .max(400, "Le contenu doit contenir 400 caractères au maximum"),
  feedbackId: z.string(),
  parentId: z.string().trim().optional().or(z.literal("")),
});

export type CreateFeedback = TypeOf<typeof createFeedbackSchema>;
export type CreateComment = TypeOf<typeof createCommentSchema>;
