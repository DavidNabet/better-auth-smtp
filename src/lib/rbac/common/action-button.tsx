import { ReactNode } from "react";
import { AnyStatement } from "../permissions";
import { ActionGuard } from "./action-guard";
import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  className: string;
  action: AnyStatement;
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "secondary" | "outline" | "ghost";
}

export function ActionButton({
  className,
  action,
  onClick,
  variant = "default",
  children,
}: ActionButtonProps) {
  return (
    <ActionGuard action={action}>
      <Button
        className={className}
        type="button"
        variant={variant}
        onClick={onClick}
      >
        {children}
      </Button>
    </ActionGuard>
  );
}
