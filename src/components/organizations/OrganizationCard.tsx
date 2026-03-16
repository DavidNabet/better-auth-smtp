"use client";

import { CardButton } from "@/app/_components/Card";
import { ArrowRight, FolderCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Organization } from "@prisma/client";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/auth.client";

type OrganizationCardProps = {
  org: Organization;
};

export function OrganizationCard({ org }: OrganizationCardProps) {
  const { data } = authClient.useActiveOrganization();
  return (
    <CardButton
      icon={<FolderCode />}
      title={org.name}
      boxed
      className={cn(
        "border p-4 rounded-lg gap-4 border-accent-foreground/20",
        org.slug === data?.slug && "ring-3 ring-teal-400 ",
      )}
      actions={
        <Button
          asChild
          size="icon-sm"
          variant="outline"
          className="rounded-full"
        >
          <Link href={`/dashboard/organizations/${org.slug}`}>
            <ArrowRight />
          </Link>
        </Button>
      }
    />
  );
}
