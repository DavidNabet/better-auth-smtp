import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export type StatProps = {
  icon: ReactNode;
  title: string;
  stat: number | string;
};

export default function Stats({ icon, title, stat }: StatProps) {
  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 rounded-lg p-2">{icon}</div>
          <div>
            <p className="text-2xl font-semibold">{stat}</p>
            <p className="text-muted-foreground text-sm">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
