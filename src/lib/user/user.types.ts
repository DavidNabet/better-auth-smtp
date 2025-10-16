import { z } from "zod";

export type ErrorState = {
  header?: any;
  errors?: z.ZodIssue[];
  errorMessage?: z.inferFlattenedErrors<z.ZodTypeAny>["fieldErrors"];
};

export type FormState = {
  message: {
    error?: string;
    success?: string;
  };
} & ErrorState;
