"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  className?: React.ButtonHTMLAttributes<HTMLButtonElement>["className"];
  label: string;
  loading: React.ReactNode;
};

export const SubmitButton = ({
  label,
  loading,
  className,
}: SubmitButtonProps) => {
  const defaultClassName = "bg-blue-600 border border-blue-600";
  const classN =
    className ??
    `inline-block shrink-0 rounded-md px-12 py-3 text-sm font-medium text-white transition  focus:outline-none focus:ring `;
  const { pending } = useFormStatus();
  return (
    <button
      className={`${defaultClassName} ${classN}`}
      disabled={pending}
      type="submit"
    >
      {pending ? loading : label}
    </button>
  );
};
