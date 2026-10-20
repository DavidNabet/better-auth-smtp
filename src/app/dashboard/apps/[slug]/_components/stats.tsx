import { ReactNode } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpRight,
  MinusIcon,
  ShieldAlertIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type StatProps = {
  icon?: ReactNode;
  title: string;
  stat: number | string;
  status: "within" | "observe" | "exceed" | "unknown";
  className?: string;
  range?: string;
};

const statusConfig = {
  within: {
    color:
      "bg-green-600/10 dark:bg-green-400/10 text-green-600 dark:text-green-400",
    icon: <TrendingUpIcon />,
  },
  observe: {
    color:
      "bg-amber-600/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400",
    icon: <MinusIcon />,
  },
  exceed: {
    color: "bg-destructive/10 text-destructive",
    icon: <TrendingDownIcon />,
  },
  unknown: {
    color: "bg-sky-600/10 dark:bg-sky-400/10 text-sky-600 dark:text-sky-400",
    icon: <ShieldAlertIcon />,
  },
};

export default function Stats({
  icon,
  title,
  stat,
  status,
  range,
  className,
}: StatProps) {
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm font-semibold tracking-tight break-normal">
          {title}
        </CardTitle>
        {icon && (
          <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-sm [&>svg]:size-4.5">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-3xl font-semibold tracking-tight">{stat}</p>
        {range && (
          <Badge
            className={cn(
              statusConfig[status].color,
              "gap-1.5 [&>svg]:size-3.5!",
            )}
          >
            {statusConfig[status].icon}
            <span>{range}</span>
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
