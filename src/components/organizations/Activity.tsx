"use client";

import {
  Activity,
  Bot,
  MessageSquare,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import {
  cn,
  formatRelativeTime,
  formatYesterdayDate,
  getInitials,
} from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getNotificationByOrgId } from "@/lib/notification/notification.utils";

type Notification = Awaited<ReturnType<typeof getNotificationByOrgId>>;

export type ActivityType =
  | "before_member_joined"
  | "after_member_joined"
  | "member_left"
  | "member_role_changed"
  | "app_created"
  | "app_updated"
  | "settings_updated";

/**
 * fakeActivityEntries
 *
 * Tableau de données factices (fake) pour tester le composant Activity.
 *
 * Chaque entrée respecte l'interface ActivityEntry :
 * - id : identifiant unique de l'activité
 * - type : type d'activité (doit correspondre à ActivityType)
 * - user : informations sur l'utilisateur qui a reçu la notification
 * - title : description textuelle de l'activité
 * - createdAt : date/heure de l'activité
 * - projectId : (optionnel) identifiant du projet lié
 * - projectName : (optionnel) nom du projet lié
 *
 * Remarques :
 * - Les timestamps sont générés relativement à Date.now() pour simuler
 *   des activités récentes (il y a X minutes/heures/jours).
 */

export interface TeamActivityFeedProps {
  activities?: Notification;
  showFilters?: boolean;
  showSearch?: boolean;
  itemsPerPage?: number;
}

function getActivityIcon(type: string) {
  switch (type) {
    case "before_member_joined":
    case "after_member_joined":
    case "member_left":
      return UserPlus;
    case "member_role_changed":
      return Users;
    case "app_created":
    case "app_updated":
      return MessageSquare;
    case "settings_updated":
      return Bot;
    default:
      return Activity;
  }
}

function getActivityColor(type: string): string {
  switch (type) {
    case "before_member_joined":
    case "after_member_joined":
      return "text-green-400";
    case "member_left":
      return "text-red-600";
    case "app_created":
    case "app_updated":
      return "text-indigo-600";
    default:
      return "text-muted-foreground";
  }
}

export default function TeamActivityFeed({
  activities = [],
  itemsPerPage = 10,
  showFilters = true,
  showSearch = true,
}: TeamActivityFeedProps) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedCount, setDisplayedCount] = useState(itemsPerPage);

  const filteredActivities = useMemo(() => {
    let filtered = activities;
    if (typeFilter !== "all") {
      filtered = filtered.filter((a) =>
        a.type.match(new RegExp(typeFilter, "i")),
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a?.user?.name?.toLowerCase().includes(query),
      );
    }
    return filtered;
  }, [activities, typeFilter, searchQuery]);

  const displayedActivities = filteredActivities.slice(0, displayedCount);
  const hasMore = displayedActivities.length < filteredActivities.length;

  const groupedActivities = displayedActivities.reduce(
    (groups, activity) => {
      const dateKey = formatYesterdayDate(activity.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
      return groups;
    },
    {} as Record<string, Notification>,
  );

  return (
    <Card className="w-full shadow-xs">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>Recent team activity and updates</CardDescription>
          </div>
          <div className="flex flex-col flex-wrap gap-2 md:flex-row">
            {showSearch && (
              <InputGroup className="flex-1">
                <InputGroupAddon>
                  <Search className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  placeholder="Search activities..."
                  type="search"
                  value={searchQuery}
                />
              </InputGroup>
            )}
            {showFilters && (
              <Select onValueChange={setTypeFilter} value={typeFilter}>
                <SelectTrigger className="w-full md:w-45">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="member">Member joined</SelectItem>
                  <SelectItem value="app_created">Apps</SelectItem>
                  <SelectItem value="settings_updated">Settings</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {displayedActivities.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Activity className="size-6" />
              </EmptyMedia>
              <EmptyTitle>
                {searchQuery || typeFilter !== "all"
                  ? "No activities found"
                  : "No activities yet"}
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-6 pt-2 h-70 overflow-y-auto">
            {Object.entries(groupedActivities).map(
              ([dateKey, dateActivities]) => (
                <div key={dateKey}>
                  <div className="relative mb-8">
                    <Separator />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-secondary px-2 text-muted-foreground text-xs">
                        {dateKey}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {dateActivities.map((activity) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <div
                          className="flex items-start gap-3"
                          key={activity.id}
                        >
                          <Avatar className="size-8 shrink-0">
                            <AvatarImage
                              alt={activity?.user?.name!}
                              src={activity?.user?.image!}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(activity?.user?.name!)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {activity.user.name}
                              </span>
                              <div
                                className={cn(
                                  "flex size-4 items-center justify-center rounded-full",
                                  getActivityColor(activity.type),
                                )}
                              >
                                <Icon className="size-3" />
                              </div>
                            </div>
                            <p className="wrap-break-word text-sm">
                              {activity.title}
                            </p>
                            <span className="text-muted-foreground text-xs">
                              {formatRelativeTime(activity.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ),
            )}
            {hasMore && (
              <Button
                className="w-full"
                type="button"
                variant="outline"
                onClick={() => setDisplayedCount((prev) => prev + itemsPerPage)}
              >
                Load More
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
