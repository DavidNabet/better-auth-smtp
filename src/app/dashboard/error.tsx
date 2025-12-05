"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <div></div>;
}
