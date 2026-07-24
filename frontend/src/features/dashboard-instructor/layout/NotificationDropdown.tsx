"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell, Search, AlertTriangle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import useSWR from "swr";
import { 
  getNotificationsAction, 
  markNotificationAsReadAction, 
  markAllNotificationsAsReadAction 
} from "@/src/features/dashboard-shared/actions/notification-actions";

import { formatDistanceToNow } from "date-fns";

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
  actionUrl?: string;
  type: "GROUP_INVITE" | "MEETING_SCHEDULED" | "MEETING_STARTING" | "RECORDING_READY" | "ANALYTICS_READY" | "ENGAGEMENT_ALERT" | "SYSTEM" | string;
}

function NotificationItem({
  data,
  onRead,
}: {
  data: NotificationData;
  onRead: () => void;
}) {
  const IconMap: Record<string, React.ReactNode> = {
    GROUP_INVITE: (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-success-soft text-xs font-semibold text-status-success">
        <Bell className="h-4 w-4" />
      </div>
    ),
    MEETING_SCHEDULED: (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-cyan/20 text-brand-cyan">
        <Bell className="h-4 w-4" />
      </div>
    ),
    RECORDING_READY: (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-purple/20 text-brand-purple">
        <Search className="h-4 w-4" />
      </div>
    ),
    ANALYTICS_READY: (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft-subtle text-primary">
        <Search className="h-4 w-4" />
      </div>
    ),
    ENGAGEMENT_ALERT: (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive-soft text-destructive">
        <AlertTriangle className="h-4 w-4" />
      </div>
    ),
    SYSTEM: (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-custom-gray text-foreground">
        <Search className="h-4 w-4" />
      </div>
    ),
  };

  const IconRender = IconMap[data.type] || IconMap["SYSTEM"];

  return (
    <div
      onClick={onRead}
      className={cn(
        "relative flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-muted-hover",
        !data.read && "bg-primary-soft-subtle",
      )}
    >
      {!data.read && (
        <span className="absolute left-2  h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary" />
      )}
      {IconRender}

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm text-foreground",
              !data.read ? "font-bold" : "font-medium",
            )}
          >
            {data.title}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground mb-1">
            {formatDistanceToNow(new Date(data.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground-soft-90">
          {data.body}
        </p>
      </div>
    </div>
  );
}

function useNotifications() {
  const { data: notifications = [], mutate } = useSWR<NotificationData[]>(
    'notifications',
    () => getNotificationsAction(),
    { 
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 10000, 
      focusThrottleInterval: 10000, 
    }
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {

    mutate(notifications.map(n => n.id === id ? { ...n, read: true } : n), false);

    await markNotificationAsReadAction(id);
    mutate(); // Revalidate in background
  };

  const markAllAsRead = async () => {

    mutate(notifications.map(n => ({ ...n, read: true })), false);

    await markAllNotificationsAsReadAction();
    mutate(); // Revalidate
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}

export function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [visibleCount, setVisibleCount] = useState(6);

  const handleNotificationClick = (n: NotificationData) => {
    markAsRead(n.id);
    if (n.actionUrl) {
      setIsOpen(false);
      router.push(n.actionUrl);
    }
  };

  const visibleNotifications = useMemo(() => {
    return notifications.slice(0, visibleCount);
  }, [notifications, visibleCount]);

  const groupedNotifications = useMemo(() => {
    return visibleNotifications.reduce<Record<string, NotificationData[]>>(
      (acc, n) => {
        const group = "Recent Alerts"; // Simplify grouping for now
        if (!acc[group]) acc[group] = [];
        acc[group].push(n);
        return acc;
      },
      {},
    );
  }, [visibleNotifications]);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
        className={cn(
          "relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-medium bg-transparent p-0 text-muted-foreground outline-none transition-all hover:bg-custom-gray hover:text-foreground",
          isOpen && "bg-custom-gray text-foreground",
        )}
      >
        <Bell className="h-7 w-7" />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-primary-foreground">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[250]">
          {}
          <div 
            className="bg-overlay pointer-events-auto" 
            onClick={() => setIsOpen(false)} 
          />

          {}
          <div
            className="fixed top-16 right-2 sm:right-6 z-[300] w-[calc(100vw-1rem)] max-w-[97%] sm:w-96 sm:max-w-96 overflow-hidden rounded-soft border border-border bg-card p-0 shadow-hard animate-in fade-in-0 zoom-in-95 duration-100"
          >
            <span className="sm:absolute hidden -top-1.5 right-4.5 z-20 h-3 w-3 rotate-45 border-l border-t border-border bg-card"></span>

            {}
            <div className="relative z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <Badge className="h-5 rounded-full bg-destructive px-1.5 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="gap-1 border border-border text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Bell className="h-3.5 w-3.5" />
                  Mark all read
                </Button>
              )}
            </div>

            {}
            <div className="max-h-96 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 opacity-30" />
                  <span className="text-xs">No notifications yet</span>
                </div>
              ) : (
                Object.entries(groupedNotifications).map(([group, items]) => (
                  <div key={group} className="mb-3 flex flex-col last:mb-0">
                    <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </p>
                    <div className="flex flex-col gap-2">
                      {items.map((n) => (
                        <NotificationItem
                          key={n.id}
                          data={n}
                          onRead={() => handleNotificationClick(n)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {}
            <div className="border-t border-border bg-card p-2">
              {visibleCount < notifications.length ? (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 4)}
                  className="w-full py-1.5 text-center text-xs font-semibold text-primary transition-colors hover:text-primary-hover bg-transparent border-none cursor-pointer outline-none"
                >
                  Load more notifications
                </button>
              ) : (
                <p className="py-1.5 text-center text-xs font-medium text-muted-foreground m-0">
                  All notifications loaded
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
