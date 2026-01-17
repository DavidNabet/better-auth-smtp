import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon, Star } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime, slugify } from "@/lib/utils";

export type ActivityProps = {
  title: string;
  activeAt: Date;
  href: string;
};

export default function Activity({ title, activeAt, href }: ActivityProps) {
  return (
    <div className="flex flex-col rounded-lg gap-4 border-b pb-4 p-4 sm:flex-row sm:items-center last:border-0">
      <div className="flex flex-1 items-start gap-4">
        <div className="bg-muted rounded-full p-2">
          <Star className="text-muted-foreground size-4" />
        </div>
        <div>
          <p className="text-sm">{title}</p>
          <p className="text-muted-foreground text-xs">
            {formatRelativeTime(activeAt)}
          </p>
        </div>
      </div>
      <Button
        className="w-full sm:w-auto"
        type="button"
        variant="default"
        size="sm"
        asChild
      >
        <Link href={`/dashboard/feedbacks/${slugify(href)}`}>
          <ArrowUpRightIcon />
          Voir
        </Link>
      </Button>
    </div>
  );
}
