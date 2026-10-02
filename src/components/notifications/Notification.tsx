"use client";
import {
  InboxButton,
  InboxPanel,
  useInbox,
  InboxNotification,
  formatRelativeTime,
} from "better-inbox/react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth.client";
import { cn, getInitials } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ForwardRefExoticComponent, useState, RefAttributes, use } from "react";
import { Button } from "../ui/button";
import {
  Bell,
  Check,
  CheckCheck,
  LucideProps,
  MessageSquare,
  MoreVertical,
  X,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";
import { Session } from "@/lib/auth";

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

interface NotificationProps {
  userNotify: Session["user"];
}

export default function Notification({ userNotify }: NotificationProps) {
  const router = useRouter();
  const {
    filter,
    markRead,
    markAllRead,
    loadMore,
    isLoading,
    notifications,
    refresh,
    unreadCount,
  } = useInbox(authClient, {
    pageSize: 5,
  });
  const [openDrawer, setOpenDrawer] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredNotifications = notifications.filter((notification) => {
    const matchesType =
      typeFilter === "all" || notification.type === typeFilter;

    const matchesStatus =
      filter === "all" || (statusFilter === "unread" && !notification.read);

    return matchesType && matchesStatus;
  });
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
                  {unreadCount > 0 && (
                    <span className="text-primary">{unreadCount} unread</span>
                  )}
                  {unreadCount === 0 && "Messages tous lus!"}
                </DrawerDescription>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    onClick={markAllRead}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <CheckCheck className="size-4" />
                    Mark all read
                  </Button>
                )}
                {/* {onClearAll && (
                  <Button
                    onClick={onClearAll}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <X className="size-4" />
                    Clear all
                  </Button>
                )} */}
              </div>
            </div>
            {filter && (
              <div className="flex flex-wrap gap-2">
                <Select onValueChange={setTypeFilter} value={typeFilter}>
                  <SelectTrigger className="w-full md:w-35">
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
                  <SelectTrigger className="w-full md:w-35">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={refresh}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </DrawerHeader>
        <Card className="w-full shadow-none border-none overflow-y-auto">
          <CardContent className="px-4">
            {notifications.length === 0 ? (
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
                  const isLast = index === notifications.length - 1;

                  return (
                    <div key={notification.id}>
                      <NotificationCard
                        notification={notification}
                        isFirst={isFirst}
                        isLast={isLast}
                        Icon={Icon}
                        markRead={markRead}
                        user={userNotify}
                      />
                      <>
                        {index < filteredNotifications.length - 1 && (
                          <Separator />
                        )}
                      </>
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

function NotificationCard({
  notification,
  isFirst,
  isLast,
  Icon,
  markRead,
  user,
}: {
  notification: InboxNotification;
  isFirst: boolean;
  isLast: boolean;
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  markRead: (id: string) => Promise<void>;
  user: Session["user"];
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 transition-colors",
        !notification.read && "bg-teal-500/15",
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
        {notification.userId ? (
          <Avatar>
            <AvatarImage alt={user?.name} src={user?.image!} />
            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
        ) : (
          <Icon className="size-5" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-medium">{notification.title}</span>
          {!notification.read && (
            <div className="size-2 shrink-0 rounded-full bg-teal-600" />
          )}
          <Badge className="text-xs" variant="outline">
            {notification.type}
          </Badge>
        </div>
        <p className="wrap-break-word text-muted-foreground text-sm"></p>
        <span className="text-muted-foreground text-xs">
          {formatRelativeTime(new Date(notification.createdAt))}
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
          {notification.href && (
            <DropdownMenuItem asChild>
              <a href={notification.href}>
                <MessageSquare className="size-4" />
                Voir
              </a>
            </DropdownMenuItem>
          )}
          {!notification.read && (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                markRead(notification.id);
              }}
            >
              <Check className="size-4" />
              Mark as read
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
