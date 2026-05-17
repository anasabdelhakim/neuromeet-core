"use client";

import { useState, useTransition } from "react"; // Added useState
import { LogOut, User, Settings } from "lucide-react";

// import { LogoutAccount } from "@/src/features/auth/actions/login";

import { Button } from "@/src/components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/src/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/src/components/ui/popover";
import Link from "next/link";

import { cn } from "@/src/lib/utils";

interface ProfileData {
  full_name: string;
  email: string;
  avatar_url: string | null;
  is_verified: boolean;
}

interface AvatarSecProps {
  profile: ProfileData;
}

/**
 * Get initials from a name for avatar fallback
 */
const DEFAULT_AVATAR_URL = "https://api.dicebear.com/7.x/initials/svg";
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get avatar URL with proper fallback
 */
function getAvatarSrc(profile: ProfileData): string {
  if (profile?.avatar_url && profile.avatar_url.trim() !== "") {
    return profile.avatar_url;
  }

  const name = profile?.full_name || "User";
  const initials = getInitials(name);
  return `${DEFAULT_AVATAR_URL}?seed=${encodeURIComponent(initials)}&backgroundColor=1a768d&fontSize=38`;
}

const AvatarSec = ({ profile }: AvatarSecProps) => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false); // New state to control overlay

  const avatarSrc = getAvatarSrc(profile);
  const displayName = profile?.full_name || "User";
  const initials = getInitials(displayName);

  return (
    <>
      {isOpen && (
        <div className="absolute inset-0 z-10 animate-in fade-in duration-200 h-screen  overflow-hidden bg-gradient-to-b from-transparent via-black/60  to-black/50" />
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
        <PopoverTrigger
          className={cn(
            "h-10 w-10 p-0 rounded-full bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity outline-none",
            isOpen
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
              : "",
          )}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={avatarSrc}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={16}
          className="w-64  z-50 relative overflow-visible shadow-lg border-border"
        >
          {/* Custom Arrow with matching border and background */}
          <span className="absolute w-3 h-3 bg-card border-t border-l border-border rotate-45 -top-1.5 right-3.5 z-20"></span>

          {/* User Info */}
          <div className="flex items-center gap-3 mb-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col min-w-0">
              <p className="font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-0.5">
            <Link href="/profile" className="w-full">
              <Button
                variant="ghost"
                className="justify-start gap-2 w-full h-9 text-sm"
              >
                <User className="h-4 w-4" /> View Profile
              </Button>
            </Link>

            <Link href="/settings" className="w-full">
              <Button
                variant="ghost"
                className="justify-start gap-2 w-full h-9 text-sm"
              >
                <Settings className="h-4 w-4" /> Account Settings
              </Button>
            </Link>

            <div className="border-t border-border my-1" />

            <Button
              variant="ghost"
              className="justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/7 h-9 text-sm"
              disabled={isPending}
              // onClick={() => startTransition(() => LogoutAccount())}
            >
              <LogOut className="h-4 w-4" />
              {isPending ? "Logging out..." : "Log out"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default AvatarSec;
