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
import { cn, getInitials, formatRelativeTime, formatDate } from "@/lib/utils";
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
import { useSocket } from "@/hooks/use-socket";
import { toast } from "sonner";
import { NotificationsInvitations } from "./notifications/NotificationsInvitations";
import { Notification } from "@prisma/client";
import {
  getNotificationsByUserId,
  onMarkAsRead,
} from "@/lib/notification/notification.utils";
import { unstable_noStore } from "next/cache";

unstable_noStore();

type NotificationType =
  | "mention"
  | "ai_event"
  | "member_joined"
  | "invitation_pending"
  | "system"
  | "info";

export interface TeamNotification {
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
  invitationId?: string;
  read: boolean;
  createdAt: Date;
}

type AllNotification = Awaited<ReturnType<typeof getNotificationsByUserId>>;
type onMarkAsReadType = ReturnType<typeof onMarkAsRead>;
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
 * - createdAt : date d'expiration de la notification
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
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // il y a 5 minutes
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
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // il y a 30 minutes
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
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // il y a 1 jour
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
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // il y a 3 jours
  },
];

interface TeamNotificationsProps {
  onMarkAllAsRead?: () => Promise<void>;
  onDelete?: (notificationId: string) => Promise<void>;
  onClearAll?: () => Promise<void>;
  showFilters?: boolean;
  unreadCount?: number;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "mention":
      return MessageSquare;
    case "ai_event":
      return Bell;
    default:
      return Bell;
  }
}

// TODO: Créer les fonctions de gestion pour les notifications
export default function Notifications({
  showFilters,
  onClearAll,
  onDelete,
  onMarkAllAsRead,
  unreadCount,
}: TeamNotificationsProps) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDrawer, setOpenDrawer] = useState(false);

  const [notifications, setNotifications] = useState<AllNotification>([]);

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    console.log("Socket connected");

    socket.on("message", (newNotif) => {
      setNotifications((prev) => {
        // Evite les doublons: vérifié si la notif existe déjà
        const isDuplicate = prev?.some((n) => n.id === newNotif.id);
        if (isDuplicate) {
          console.warn(`Notification dupliquée détectée: ${newNotif.id}`);
        }
        return [newNotif, ...prev];
      });
    });

    // Ecoute l'événement "display_toast" du serveur pour afficher une notification toast
    socket.on("display_toast", (data) => {
      console.log("display_toast received: ", data);
      toast(data.message, {
        description: `Vous avez ${data.notifications.length} notifications non lues`,
        action: {
          label: "Voir",
          onClick: () => setOpenDrawer(true),
        },
      });
    });

    return () => {
      socket.off("message");
      socket.off("display_toast");
    };
  }, [socket]);

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

  async function handleAcceptNotification(notificationId: string) {
    await fetch(`/api/notifications/${notificationId}`, {
      method: "POST",
    });

    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? { ...notif, read: true, status: "accepted" }
          : notif,
      ),
    );
  }

  return (
    <Drawer direction="right" open={openDrawer} onOpenChange={setOpenDrawer}>
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
                    <SelectItem value="invitation_pending">
                      Invitations
                    </SelectItem>
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
        <Card className="w-full shadow-none border-none overflow-y-auto">
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
                                alt={notification.user.name!}
                                src={notification.user.image!}
                              />
                              <AvatarFallback>
                                {getInitials(notification.user.name!)}
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
                            {formatRelativeTime(
                              new Date(notification.createdAt),
                            )}
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
                            {notification.type === "invitation_pending" && (
                              <NotificationsInvitations
                                invitationId={notification?.invitationId!}
                              >
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <CheckCheck className="size-4" />
                                  Respond to invitation
                                </DropdownMenuItem>
                              </NotificationsInvitations>
                            )}
                            {!notification.read && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleAcceptNotification(notification.id);
                                }}
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
