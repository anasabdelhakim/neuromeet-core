"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";

import { Bell, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";
import UserProfile from "@/src/app/(auth)/user-profile/profile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Badge } from "@/src/components/ui/badge";

// Map paths to their respective titles
const pageTitles: Record<string, string> = {
  "/dashboard-instructor": "Home",
  "/dashboard-instructor/upcoming": "Upcoming Meetings",
  "/dashboard-instructor/previous": "Previous Meetings",
  "/dashboard-instructor/settings": "Settings",
};

// Premium Mock Notifications Data
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "New student joined",
    description: "Sarah Jenkins joined your course 'Advanced Neural Networks'.",
    time: "10m ago",
    read: false,
    group: "Today",
    type: "join",
  },
  {
    id: "2",
    title: "Meeting rescheduled",
    description:
      "The private research session with Dr. Alan has been moved to 3:00 PM.",
    time: "2h ago",
    read: false,
    group: "Today",
    type: "schedule",
  },
  {
    id: "3",
    title: "System update",
    description:
      "NeuroMeet v2.4.0 is now live. Enjoy our brand new glassmorphic UI!",
    time: "1d ago",
    read: true,
    group: "Yesterday",
    type: "system",
  },
];

interface NotificationData {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  group: string;
  type: string;
}

function NotificationItem({
  data,
  onRead,
}: {
  data: NotificationData;
  onRead: () => void;
}) {
  const getIcon = () => {
    switch (data.type) {
      case "join":
        return (
          <div className="h-9 w-9 shrink-0 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-semibold">
            SJ
          </div>
        );
      case "schedule":
        return (
          <div className="h-9 w-9 shrink-0 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <Bell className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Search className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <div
      onClick={onRead}
      className={cn(
        "flex gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer relative",
        !data.read && "bg-primary/5",
      )}
    >
      {!data.read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
      )}

      {getIcon()}

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex justify-between items-baseline gap-2">
          <p
            className={cn(
              "text-sm text-foreground truncate",
              !data.read ? "font-bold" : "font-medium",
            )}
          >
            {data.title}
          </p>
          <span className="text-xs text-muted-foreground shrink-0">
            {data.time}
          </span>
        </div>
        <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
          {data.description}
        </p>
      </div>
    </div>
  );
}

export function InstructorTopbar() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
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

  // Get the title from the mapping, default to "Dashboard" if not found
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <>
      {isOpen && (
        <div className="absolute inset-0 z-10 animate-in fade-in duration-200 h-screen  overflow-hidden bg-gradient-to-b from-transparent via-black/60  to-black/50" />
      )}
      <header
        className={cn(
          "flex items-center justify-between px-8 py-4 gap-4 transition-all z-50 bg-transparent",
        )}
      >
        <h1 className="text-2xl font-semibold">{title}</h1>

        {/* Search pill */}
        <InputGroup className="w-md py-5 flex-1 max-w-md">
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <Search className="size-5" />
          </InputGroupAddon>
        </InputGroup>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger
              className={cn(
                "relative h-12 w-12 p-0 rounded-md  cursor-pointer flex justify-center items-center transition-all outline-none text-muted-foreground hover:text-foreground bg-transparent hover:bg-custom-gray",
                isOpen ? "bg-custom-gray text-foreground" : "",
              )}
            >
              <Bell className="h-7 w-7" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4.5 w-4.5 flex justify-center items-center text-xs font-bold  rounded-full bg-red-500 text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={12}
              className="w-96 p-0 rounded-xl shadow-lg border-border z-50 bg-card overflow-hidden"
            >
              <span className="absolute w-3 h-3 bg-card border-t border-l border-border rotate-45 -top-1.5 right-4.5 z-20"></span>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card relative z-30">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground text-base">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <Badge className="h-5 px-1.5 text-xs rounded-full bg-red-500">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-primary transition-colors font-medium border border-border rounded-md px-2 py-1 hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-sm overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                    <Bell className="h-8 w-8 opacity-30" />
                    <span className="text-xs">No notifications yet</span>
                  </div>
                ) : (
                  Object.entries(
                    notifications.reduce<Record<string, typeof notifications>>(
                      (acc, n) => {
                        (acc[n.group] ??= []).push(n);
                        return acc;
                      },
                      {},
                    ),
                  ).map(([group, items]) => (
                    <div key={group} className="flex flex-col mb-3 last:mb-0">
                      <p className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
              <div className="border-t border-border p-2 bg-card">
                <Link
                  href="/dashboard-instructor/settings"
                  className="block text-center text-xs text-primary hover:text-primary/80 transition-colors py-1.5 font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          <UserProfile />
        </div>
      </header>
    </>
  );
}
