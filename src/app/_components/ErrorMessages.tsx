import { ZodIssue } from "zod";

export const ErrorMessages = ({
  error,
  errors,
}: // error,
{
  errors?: string[] | null;
  error?: string | null;
}) => {
  if (!errors) return null;
  const text = errors.join(", ");
  return error ? (
    <p className="text-sm text-red-600">{error}</p>
  ) : (
    <p className="text-sm text-red-600">{text}</p>
  );
};

export const findErrors = (fieldName: string, errors: ZodIssue[]) => {
  if (!errors) return null;
  return errors
    .filter((item) => {
      return item.path.includes(fieldName);
    })
    .map((item) => item.message);
};
