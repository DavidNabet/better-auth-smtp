import { ButtonHTMLAttributes, ClassAttributes, ReactNode } from "react";
import { AnyStatement } from "../permissions";
import { ActionGuard } from "./action-guard";
import { Button, buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";

interface ActionButtonProps {
  className: string;
  action: AnyStatement;
  children: ReactNode;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline" | "ghost";
  resourceOwnerId?: string;
}

export function ActionButton({
  className,
  action,
  onClick,
  variant = "default",
  children,
  resourceOwnerId,
}: ActionButtonProps) {
  return (
    <ActionGuard action={action} resourceOwnerId={resourceOwnerId}>
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
