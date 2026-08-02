"use client";

import { Fragment, ReactNode, useState, useEffect } from "react";
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
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth/auth.client";
// import { Switcher } from "@/components/organizations/Switcher";

export default function Breadcrumbs({ children }: { children?: ReactNode }) {
  const paths = usePathname();
  const pathNames = paths.split("/").filter((path) => path);
  const { session } = useAuth();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function fetchOwner() {
      try {
        if (!session) {
          setIsOwner(false);
          return;
        }
        const result = authClient.admin.checkRolePermission({
          permissions: { apps: ["apps-create"] },
          role: "SUPER_ADMIN",
        });
        setIsOwner(result);
      } catch (error) {
        setIsOwner(false);
      }
    }
    fetchOwner();
  }, [session]);

  const pattern = new URLPattern({
    pathname: "/dashboard/orgs/:slug",
  });

  // TODO: ⚠ useSelectedLayoutSegments pathname

  return (
    <Breadcrumb className={cn(paths === `/${pathNames[0]}` && "hidden")}>
      <BreadcrumbList>
        {pathNames.map((link, idx) => {
          // const isActive = pathNames.length === idx + 1;
          let itemLink =
            link.charAt(0).toUpperCase() + link.slice(1, link.length);

          // Use a stable key based on the path segment instead of array index
          // This prevents React from misidentifying items when the breadcrumb trail changes
          const breadcrumbKey = pathNames.slice(0, idx + 1).join("/");

          return (
            <Fragment key={breadcrumbKey}>
              {idx > 0 && <BreadcrumbSeparator />}

              <BreadcrumbItem>
                {idx !== pathNames.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={"/" + breadcrumbKey} className="text-metal">
                      {itemLink}
                    </Link>
                  </BreadcrumbLink>
                ) : pattern.test({ pathname: paths }) ? (
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
