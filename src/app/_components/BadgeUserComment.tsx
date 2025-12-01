"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import { ReactNode } from "react";
import { Shield, Crown, UserRound } from "lucide-react";

const roleClasses = {
  ADMIN: {
    className:
      "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 [a&]:hover:bg-blue-600/10 [a&]:hover:text-blue-600/90 dark:[a&]:hover:bg-blue-400/10 dark:[a&]:hover:text-blue-400/90",
    icon: <Crown className="size-3" />,
  },
  MEMBER: {
    className:
      "border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400 [a&]:hover:bg-amber-600/10 [a&]:hover:text-amber-600/90 dark:[a&]:hover:bg-amber-400/10 dark:[a&]:hover:text-amber-400/90",
    icon: <Shield className="size-3" />,
  },
  USER: {
    className:
      "border-primary text-primary-600 dark:border-primary-400 dark:text-primary-400 [a&]:hover:bg-primary-600/10 [a&]:hover:text-primary-600/90 dark:[a&]:hover:bg-primary-400/10 dark:[a&]:hover:text-primary-400/90",
    icon: <UserRound className="size-3" />,
  },
} as Record<Role, { className: string; icon: ReactNode }>;

const getRole = (role: Role) => {
  return roleClasses[role];
};

export default function BadgeUserComment({
  role,
  name,
}: {
  role: Role;
  name: string;
}) {
  const { className, icon } = getRole(role);
  return (
    <Badge
      className={cn("font-medium text-xs rounded-full", className)}
      variant="outline"
    >
      {icon}
      {name ?? "@user"}
    </Badge>
  );
}
