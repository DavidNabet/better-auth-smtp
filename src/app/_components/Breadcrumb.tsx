"use client";

import { Fragment, ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useActions } from "@/lib/rbac/common/action-guard";

export default function Breadcrumbs({ children }: { children?: ReactNode }) {
  const paths = usePathname();
  const pathNames = paths.split("/").filter((path) => path);
  const { canPerform } = useActions();

  // TODO: ⚠ useSelectedLayoutSegments pathname

  return (
    <Breadcrumb className={cn(paths === `/${pathNames[0]}` && "hidden")}>
      <BreadcrumbList>
        {pathNames.map((link, idx) => {
          // const isActive = pathNames.length === idx + 1;
          let href = `/${pathNames.slice(0, idx + 1).join("/")}`;
          let itemLink =
            link.charAt(0).toUpperCase() + link.slice(1, link.length);

          const isOwner = canPerform("apps-create");

          return (
            <Fragment key={idx}>
              {idx > 0 && <BreadcrumbSeparator />}

              <BreadcrumbItem>
                {idx !== pathNames.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={href} className="text-metal">
                      {itemLink}
                    </Link>
                  </BreadcrumbLink>
                ) : paths.startsWith("/dashboard/organizations/") ? (
                  <>
                    {isOwner ? (
                      children
                    ) : (
                      <BreadcrumbPage>{itemLink}</BreadcrumbPage>
                    )}
                  </>
                ) : (
                  <BreadcrumbPage>{itemLink}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
