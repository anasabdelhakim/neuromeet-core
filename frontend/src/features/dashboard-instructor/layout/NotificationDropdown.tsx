"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell, Search, AlertTriangle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

interface NotificationData {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  group: string;
  type: "join" | "schedule" | "system" | "alert" | string;
}

const MOCK_NOTIFICATIONS: NotificationData[] = [
  {
    id: "ai-alert-1",
    title: "Low Engagement Alert",
    description: "Student Anas Abdelhakim has been consistently disengaged for the past 2 minutes.",
    time: "Just now",
    read: false,
    group: "Live Session Alerts",
    type: "alert",
  },
  {
    id: "ai-alert-2",
    title: "Class Distraction Warning",
    description: "Multiple students in 'System Design Cohort' appear to be away from their keyboards.",
    time: "5 min ago",
    read: false,
    group: "Live Session Alerts",
    type: "alert",
  },
  {
    id: "ai-alert-3",
    title: "Engagement Dropping",
    description: "Overall class engagement has dropped below 40% in your current session.",
    time: "15 min ago",
    read: true,
    group: "Live Session Alerts",
    type: "alert",
  },
  {
    id: "sys-1",
    title: "Session Report Ready",
    description: "The AI engagement analytics report for 'Machine Learning 101' is ready for review.",
    time: "2 hours ago",
    read: true,
    group: "System Updates",
    type: "system",
  },
  {
    id: "sys-2",
    title: "Platform Maintenance",
    description: "NeuroMeet will undergo scheduled maintenance this Sunday at 2:00 AM EST.",
    time: "Yesterday",
    read: true,
    group: "System Updates",
    type: "system",
  },
  {
    id: "sys-3",
    title: "New AI Feature Unlocked",
    description: "You can now export engagement graphs directly to PDF. Try it out in your analytics dashboard!",
    time: "2 days ago",
    read: true,
    group: "System Updates",
    type: "system",
  },
  {
    id: "join-1",
    title: "New Student Joined",
    description: "Sarah Jenkins has successfully enrolled in 'Web Dev Bootcamp'.",
    time: "3 hours ago",
    read: false,
    group: "Course Activity",
    type: "join",
  },
  {
    id: "join-2",
    title: "New Student Joined",
    description: "Michael Chang has successfully enrolled in 'Advanced Algorithms'.",
    time: "Yesterday",
    read: true,
    group: "Course Activity",
    type: "join",
  },
  {
    id: "join-3",
    title: "Waitlist Update",
    description: "3 new students have joined the waitlist for your upcoming 'System Design Cohort'.",
    time: "2 days ago",
    read: true,
    group: "Course Activity",
    type: "join",
  },
  {
    id: "sch-1",
    title: "Meeting Starting Soon",
    description: "Your session 'Capstone Project Review' starts in 15 minutes.",
    time: "Just now",
    read: false,
    group: "Upcoming Meetings",
    type: "schedule",
  },
  {
    id: "sch-2",
    title: "Schedule Conflict",
    description: "A student requested a 1-on-1 that overlaps with your current office hours.",
    time: "1 hour ago",
    read: false,
    group: "Upcoming Meetings",
    type: "schedule",
  },
  {
    id: "sch-3",
    title: "Session Rescheduled",
    description: "'Intro to Neural Networks' has been moved to Thursday at 3:00 PM.",
    time: "Yesterday",
    read: true,
    group: "Upcoming Meetings",
    type: "schedule",
  }
];

function NotificationItem({
  data,
  onRead,
}: {
  data: NotificationData;
  onRead: () => void;
}) {
  const IconMap: Record<string, React.ReactNode> = {
    join: (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-success-soft text-xs font-semibold text-status-success">
        SJ
      </div>
    ),
    schedule: (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
        <Bell className="h-4 w-4" />
      </div>
    ),
    system: (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft-subtle text-primary">
        <Search className="h-4 w-4" />
      </div>
    ),
    alert: (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive-soft text-destructive">
        <AlertTriangle className="h-4 w-4" />
      </div>
    ),
  };

  const IconRender = IconMap[data.type] || IconMap["system"];

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
            {data.time}
          </span>
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground-soft-90">
          {data.description}
        </p>
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleReadNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const groupedNotifications = useMemo(() => {
    return notifications.reduce<Record<string, NotificationData[]>>(
      (acc, n) => {
        if (!acc[n.group]) acc[n.group] = [];
        acc[n.group].push(n);
        return acc;
      },
      {},
    );
  }, [notifications]);

  return (
    <>
      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="bg-overlay" />,
        document.body
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
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
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={12}
          className="z-modal w-96 overflow-hidden rounded-soft border-border bg-card p-0 shadow-hard"
        >
          <span className="absolute -top-1.5 right-4.5 z-20 h-3 w-3 rotate-45 border-l border-t border-border bg-card"></span>

          {/* Header */}
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
                onClick={handleMarkAllRead}
                className="gap-1 border border-border text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Bell className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
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
                        onRead={() => handleReadNotification(n.id)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-card p-2">
            <Link
              href="/dashboard-instructor/settings"
              className="block py-1.5 text-center text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
