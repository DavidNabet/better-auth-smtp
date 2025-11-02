import { Comment, User, Like } from "@prisma/client";
import { z } from "zod";

export interface CommentWithRelations extends Comment {
  user: User;
  likes: Like[];
  replies?: CommentWithRelations[];
}

/**
 * Alias pour les erreurs de champs Zod (fieldErrors) afin de simplifier le type.
 */
export type FieldErrors = z.inferFlattenedErrors<z.ZodTypeAny>["fieldErrors"];

/**
 * État de succès ou d'erreur: un message (peut alimenter un toast de succès ou un toast d'erreur).
 */
export type State = {
  status: "SUCCESS" | "ERROR";
  message?: string;
  errorMessage?: FieldErrors;
};

/**
 * État d'erreur de validation Zod:
 * - message requis (toast d'erreur),
 * - issues + fieldErrors pour afficher les erreurs de formulaire.
 */
export type ZodValidationErrorState = {
  status: "ERROR";
  message?: string;
  errors: z.ZodIssue[];
  errorMessage: FieldErrors;
};

/**
 * ActionState final: union discriminée
 * - "SUCCESS" | "ERROR" (générique) | "ERROR" (Zod)
 * - null | undefined pour conserver la compatibilité avec useActionState initial.
 */
export type ActionState = State | ZodValidationErrorState | null | undefined;
