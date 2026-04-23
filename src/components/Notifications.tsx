"use client";

import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  MoreVertical,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn, getInitials, formatRelativeTime } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type NotificationType =
  | "mention"
  | "ai_event"
  | "member_joined"
  | "system"
  | "info";

interface TeamNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  link?: string;
  read: boolean;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Tableau de notifications factices (fake) pour le développement / tests.
 *
 * Chaque entrée respecte l'interface TeamNotification :
 * - id : identifiant unique de la notification
 * - type : type de notification (doit correspondre à NotificationType)
 * - title / message : contenu affiché à l'utilisateur
 * - user : informations sur l'utilisateur lié à la notification
 * - link : lien éventuel vers une page de détail / action
 * - read : indique si la notification a été lue
 * - timestamp : date de création / réception de la notification
 * - metadata : données supplémentaires spécifiques au type de notification
 */
export const fakeTeamNotifications: TeamNotification[] = [
  {
    id: "1",
    type: "member_joined", // adapte selon les valeurs réelles de NotificationType
    title: "Nouvelle invitation d'équipe",
    message: "Vous avez été invité à rejoindre l'équipe « Frontend Squad ».",
    user: {
      id: "u_1",
      name: "Alice Martin",
      avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=alice",
    },
    link: "/teams/frontend-squad",
    read: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // il y a 5 minutes
    metadata: {
      teamId: "team_frontend_squad",
      role: "MEMBER",
    },
  },
  {
    id: "2",
    type: "mention",
    title: "Vous avez été mentionné",
    message: "Thomas vous a mentionné dans le canal #general.",
    user: {
      id: "u_2",
      name: "Thomas Dupont",
      avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=thomas",
    },
    link: "/channels/general?message=123",
    read: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // il y a 30 minutes
    metadata: {
      channelId: "general",
      messageId: "123",
    },
  },
  {
    id: "3",
    type: "info",
    title: "Changement de rôle",
    message: "Votre rôle dans l'équipe « Backend Core » a été mis à jour.",
    user: {
      id: "u_3",
      name: "Système",
    },
    link: "/teams/backend-core/settings",
    read: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // il y a 1 jour
    metadata: {
      teamId: "team_backend_core",
      previousRole: "MEMBER",
      newRole: "ADMIN",
    },
  },
  {
    id: "4",
    type: "system",
    title: "Invitation expirée",
    message:
      "Votre invitation à rejoindre l'équipe « Design System » a expiré.",
    user: {
      id: "u_4",
      name: "Julie Robert",
    },
    read: true,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // il y a 3 jours
    metadata: {
      teamId: "team_design_system",
      expiredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  },
];

interface TeamNotificationsProps {
  notifications?: TeamNotification[];
  onMarkAsRead?: (notificationId: string) => Promise<void>;
  onMarkAllAsRead?: () => Promise<void>;
  onDelete?: (notificationId: string) => Promise<void>;
  onClearAll?: () => Promise<void>;
  showFilters?: boolean;
  unreadCount?: number;
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "mention":
      return MessageSquare;
    case "ai_event":
      return Bell;
    default:
      return Bell;
  }
}

// TODO: Recevoir les notifications
export default function Notifications({
  notifications = [],
  showFilters,
  onClearAll,
  onDelete,
  onMarkAllAsRead,
  onMarkAsRead,
  unreadCount,
}: TeamNotificationsProps) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredNotifications = notifications.filter((notification) => {
    const matchesType =
      typeFilter === "all" || notification.type === typeFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && !notification.read) ||
      (statusFilter === "read" && notification.read);

    return matchesType && matchesStatus;
  });

  const unreadNotifications = filteredNotifications.filter((n) => !n.read);
  const displayUnreadCount = unreadCount ?? unreadNotifications.length;

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          aria-label="Notifications"
          type="button"
          variant="ghost"
          size="icon-sm"
        >
          <Bell className="size-4 text-primary" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col flex-wrap gap-3 md:flex-flow md:items-start md:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <DrawerTitle>Notifications</DrawerTitle>
                <DrawerDescription>
                  {displayUnreadCount > 0 && (
                    <span className="text-primary">
                      {displayUnreadCount} unread
                    </span>
                  )}
                  {displayUnreadCount === 0 && "Messages tous lus!"}
                </DrawerDescription>
              </div>
              <div className="flex gap-2">
                {onMarkAllAsRead && displayUnreadCount > 0 && (
                  <Button
                    onClick={onMarkAllAsRead}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <CheckCheck className="size-4" />
                    Mark all read
                  </Button>
                )}
                {onClearAll && (
                  <Button
                    onClick={onClearAll}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <X className="size-4" />
                    Clear all
                  </Button>
                )}
              </div>
            </div>
            {showFilters && (
              <div className="flex flex-wrap gap-2">
                <Select onValueChange={setTypeFilter} value={typeFilter}>
                  <SelectTrigger className="w-full md:w-[140px]">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="mention">Mentions</SelectItem>
                    <SelectItem value="ai_event">AI Events</SelectItem>
                    <SelectItem value="member_joined">Members</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={setStatusFilter} value={statusFilter}>
                  <SelectTrigger className="w-full md:w-[140px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </DrawerHeader>
        <Card className="w-full shadow-none border-none">
          <CardContent className="px-4">
            {filteredNotifications.length === 0 ? (
              <Empty>
                <EmptyMedia variant="icon">
                  <Bell className="size-6" />
                </EmptyMedia>
                <EmptyTitle>
                  {typeFilter !== "all" || statusFilter !== "all"
                    ? "No notifications match your filters"
                    : "No notifications yet"}
                </EmptyTitle>
              </Empty>
            ) : (
              <div className="flex flex-col gap-0">
                {filteredNotifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.type);
                  const isFirst = index === 0;
                  const isLast = index === filteredNotifications.length - 1;

                  return (
                    <div key={notification.id}>
                      <div
                        className={cn(
                          "flex items-start gap-4 p-4 transition-colors",
                          !notification.read && "bg-primary/5",
                          "hover:bg-muted/50",
                          isFirst && "rounded-t-lg",
                          isLast && "rounded-b-lg",
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-full",
                            notification.read
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          {notification.user ? (
                            <Avatar>
                              <AvatarImage
                                alt={notification.user.name}
                                src={notification.user.avatar}
                              />
                              <AvatarFallback>
                                {getInitials(notification.user.name)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <Icon className="size-5" />
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="font-medium">
                              {notification.title}
                            </span>
                            {!notification.read && (
                              <div className="size-2 shrink-0 rounded-full bg-primary" />
                            )}
                            <Badge className="text-xs" variant="outline">
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="wrap-break-word text-muted-foreground text-sm">
                            {notification.message}
                          </p>
                          <span className="text-muted-foreground text-xs">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-label="More options"
                              size="icon-sm"
                              type="button"
                              variant="ghost"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && onMarkAsRead && (
                              <DropdownMenuItem
                                onClick={() => onMarkAsRead(notification.id)}
                              >
                                <Check className="size-4" />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            {notification.link && (
                              <DropdownMenuItem asChild>
                                <a href={notification.link}>
                                  <MessageSquare className="size-4" />
                                  View
                                </a>
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onSelect={() => onDelete(notification.id)}
                                  variant="destructive"
                                >
                                  <X className="size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {index < filteredNotifications.length - 1 && (
                        <Separator />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </DrawerContent>
    </Drawer>
  );
}
