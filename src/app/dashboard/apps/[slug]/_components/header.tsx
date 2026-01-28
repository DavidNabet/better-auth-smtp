import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAppBySlug } from "@/lib/app/app.utils";
import { App } from "@prisma/client";
import { Session, User } from "@/lib/auth";
import Link from "next/link";

interface Props {
  app: Awaited<ReturnType<typeof getAppBySlug>>;
}
export default function AppHeader({ app }: Props) {
  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <Avatar className="size-20">
            <AvatarImage src={app?.logo!} alt="App logo" />
            <AvatarFallback>
              {app?.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-lg font-semibold">{app?.name}</h2>
          <Badge className="mt-2" variant="secondary">
            {app?.slug}
          </Badge>
        </div>
        <div className="mt-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created at</span>
            <span>{app?.createdAt.toLocaleDateString()}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created by</span>
            <span>{app?.member?.name}</span>
          </div>

          {app?.feedbacks && app.feedbacks.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Feedbacks</span>
              <span>{app?.feedbacks.length}</span>
            </div>
          )}
          {app?.organization && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Organization</span>
              <Link
                href={`/dashboard/organizations/${app.organization.slug}`}
                title={app.organization.name}
              >
                <Badge variant="outline">{app.organization.name}</Badge>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
