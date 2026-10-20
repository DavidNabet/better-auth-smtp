import AppRow from "@/components/apps/AppRow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { App } from "@prisma/client";

interface AppSectionProps {
  apps: App[];
}

export default function AppSection({ apps }: AppSectionProps) {
  return (
    <section className="space-y-4 py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col flex-wrap gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <CardTitle>Applications Assignées & Politiques d'accès</CardTitle>
              <CardDescription>
                Permissions appliquées exclusivement au périmètre de cette
                équipe pour le tenant actif.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {apps.map((app) => (
            <AppRow app={app} />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
