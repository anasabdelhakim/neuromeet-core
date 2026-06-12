"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import UserProfile from "@/src/app/(auth)/user-profile/profile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

// --- TYPES & DATA ---
interface NotificationData {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  group: string;
  type: "join" | "schedule" | "system" | string;
}

const pageTitles: Record<string, string> = {
  "/dashboard-instructor": "Home",
  "/dashboard-instructor/upcoming": "Upcoming Meetings",
  "/dashboard-instructor/previous": "Previous Meetings",
  "/dashboard-instructor/recordings": "Recordings",
};

const MOCK_NOTIFICATIONS: NotificationData[] = [
  // ... (Keep your existing mock data here)
];

// --- NOTIFICATION ITEM COMPONENT ---
function NotificationItem({
  data,
  onRead,
}: {
  data: NotificationData;
  onRead: () => void;
}) {
  // 1. Replaced switch statement with a clean mapping object
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
        <span className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary" />
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
          <span className="shrink-0 text-xs text-muted-foreground">
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

// --- NOTIFICATION DROPDOWN COMPONENT (Extracted logic) ---
function NotificationDropdown({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const [notifications, setNotifications] =
    useState<NotificationData[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleReadNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  // 2. Moved grouping logic out of JSX and into useMemo for performance & readability
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
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
        className="z-modal w-96 overflow-hidden rounded-soft border-border bg-card p-0 shadow-lg"
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

        {/* 3. Clean JSX Notification List */}
        <div className="max-h-sm overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <Bell className="h-8 w-8 opacity-30" />
              <span className="text-xs">No notifications yet</span>
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([group, items]) => (
              <div key={group} className="mb-3 flex flex-col last:mb-0">
                <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
  );
}

// --- MAIN TOPBAR COMPONENT ---
export function InstructorTopbar() {
  const pathname = usePathname();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <>
      {isNotificationsOpen && typeof document !== "undefined" && createPortal(
        <div className="bg-overlay" />,
        document.body
      )}

      <header className="z-sticky flex items-center justify-between gap-4 bg-transparent px-8 py-4 transition-all duration-normal ease-standard">
        <h1 className="text-2xl font-semibold">{title}</h1>

        <InputGroup className="w-md max-w-md flex-1 py-5">
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <Search className="size-5" />
          </InputGroupAddon>
        </InputGroup>

        <div className="flex items-center gap-6">
          <NotificationDropdown
            isOpen={isNotificationsOpen}
            setIsOpen={setIsNotificationsOpen}
          />
          <UserProfile />
        </div>
      </header>
    </>
  );
}
