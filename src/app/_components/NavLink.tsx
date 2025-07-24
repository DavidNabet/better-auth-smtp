"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href?: string;
  name?: string;
  className?: string;
  submenu?: string[];
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const NavLink = ({
  href,
  name,
  className,
  icon,
  children,
}: NavLinkProps) => {
  const segment = usePathname();
  const isActive = segment === href;
  const classNames =
    className ??
    "text-sm font-medium transitions-colors hover:text-primary text-muted-foreground";

  return (
    <Link
      href={href!}
      title={name}
      className={cn(classNames, isActive && "text-teal-500")}
    >
      <span>{children}</span>
    </Link>
  );
};
