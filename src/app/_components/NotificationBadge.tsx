import { Badge } from "@/components/ui/badge";
export default function NotificationBadge({
  children,
  num,
}: {
  children: React.ReactNode;
  num: number;
}) {
  return (
    <div className="relative w-fit">
      {children}
      <Badge
        variant="secondary"
        className="absolute -end-2.5 -top-2.5 h-5 min-w-5 rounded-full px-1 tabular-nums"
      >
        {num}
      </Badge>
    </div>
  );
}
