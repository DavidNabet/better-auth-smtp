"use client";

import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

const ErrorBoundary = ({ error, reset }: ErrorBoundaryProps) => {
  return (
    <div className="flex h-svh flex-col items-center justify-center text-center">
      <h1 className="font-serif text-4xl">An Error occured</h1>
      <p className="mt-2 p-3 text-lg text-slate-600 lg:w-2/3">
        {error.message}
      </p>
      <Button
        className="dark:bg-destructive/60 hover:bg-destructive focus-visible:ring-destructive text-white"
        variant="destructive"
        onClick={() => reset()}
      >
        Réessayer
      </Button>
    </div>
  );
};

export default ErrorBoundary;
