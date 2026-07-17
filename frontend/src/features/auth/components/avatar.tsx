"use client";
import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut, Settings, Trash2, Shield, User } from "lucide-react";
import { signOutAction, deleteMyAccountAction } from "@/src/features/auth/actions/auth-actions";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { toggleStudentRecordingAction, getStudentRecordingPermissionAction } from "@/src/features/dashboard-instructor/recordings/actions/recordings-actions";
interface ProfileData {
  name: string;
  email: string;
  avatarUrl?: string | null;
  role?: string;
}
interface AvatarSecProps {
  profile: ProfileData;
}
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
function getAvatarSrc(profile: ProfileData): string | undefined {
  if (profile?.avatarUrl && profile.avatarUrl.trim() !== "") {
    return profile.avatarUrl;
  }
  return undefined;
}
const AvatarSec = ({ profile }: AvatarSecProps) => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false); // New state to control overlay
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [allowStudentRecording, setAllowStudentRecording] = useState(true);
  useEffect(() => {
    startTransition(async () => {
      const allowed = await getStudentRecordingPermissionAction();
      setAllowStudentRecording(allowed);
    });
  }, []);
  const handleToggleRecording = (allowed: boolean) => {
    setAllowStudentRecording(allowed);
    startTransition(async () => {
      await toggleStudentRecordingAction(allowed);
      window.dispatchEvent(new Event("recordingPermissionChange"));
    });
  };
  const handleConfirmDelete = () => {
    startTransition(async () => {
      try {
        await deleteMyAccountAction();
      } finally {
        setIsDeleteModalOpen(false);
        setIsSettingsOpen(false);
      }
    });
  };
  const avatarSrc = getAvatarSrc(profile);
  const displayName = profile?.name || "User";
  const initials = getInitials(displayName);
  const userRole = profile?.role || "INSTRUCTOR";
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
            "h-10 w-10 p-0 rounded-full bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity duration-fast ease-standard outline-none",
            isOpen
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
              : "",
          )}
        >
          <Avatar className="h-10 w-10 overflow-hidden">
            <AvatarImage
              src={avatarSrc}
              alt={displayName}
              className="object-cover"
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className={cn(
              "text-primary-foreground font-semibold flex items-center justify-center w-full h-full",
              avatarSrc ? "bg-muted animate-pulse" : "bg-primary text-lg"
            )}>
              {!avatarSrc && initials}
            </AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={16}
          className="w-64 z-modal relative overflow-visible shadow-hard border-border"
        >
          {}
          <span className="absolute w-3 h-3 bg-card border-t border-l border-border rotate-45 -top-1.5 right-3.5 z-20"></span>
          {}
          <div className="flex items-center gap-3 mb-1">
            <Avatar className="h-12 w-12 overflow-hidden">
              <AvatarImage src={avatarSrc} alt={displayName} className="object-cover" referrerPolicy="no-referrer" />
              <AvatarFallback className={cn(
                "text-primary-foreground font-semibold flex items-center justify-center w-full h-full",
                avatarSrc ? "bg-muted animate-pulse" : "bg-primary text-xl"
              )}>
                {!avatarSrc && initials}
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
            <Button
              variant="ghost"
              className="justify-start gap-2 w-full h-9 text-sm"
              onClick={() => {
                setIsOpen(false);
                setIsSettingsOpen(true);
              }}
            >
              <Settings className="h-4 w-4" /> Account & Profile Settings
            </Button>
            <div className="border-t border-border my-1" />
            <Button
              variant="ghost"
              className="justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive-hover h-9 text-sm"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  try {
                    await signOutAction();
                  } finally {
                    setIsOpen(false);
                  }
                });
              }}
            >
              <LogOut className="h-4 w-4" />
              {isPending ? "Logging out..." : "Log out"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-soft border border-border bg-card backdrop-blur-2xl p-6 shadow-2xl flex flex-col gap-6 w-[92vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center justify-start gap-2">
              <User className="w-5 h-5 text-primary shrink-0" /> Account & Profile Settings
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1.5">
              Manage your personal information, instructor permissions, and account deletion.
            </DialogDescription>
          </DialogHeader>
          {}
          <div className="flex flex-col gap-4 border-b border-border pb-6">
            <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider text-left">Profile Information</h4>
            <div className="flex flex-col sm:flex-row items-start text-left gap-4">
              <Avatar className="h-16 w-16 border border-border shrink-0 overflow-hidden">
                <AvatarImage src={avatarSrc} alt={displayName} className="object-cover" referrerPolicy="no-referrer" />
                <AvatarFallback className={cn(
                  "text-primary-foreground font-semibold flex items-center justify-center w-full h-full",
                  avatarSrc ? "bg-muted animate-pulse" : "bg-primary text-3xl"
                )}>
                  {!avatarSrc && initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0">
                <p className="text-lg font-bold text-foreground truncate max-w-full">{displayName}</p>
                <p className="text-sm text-muted-foreground truncate max-w-full">{profile.email}</p>
                <span className="mt-2 sm:mt-1 inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 w-fit font-semibold">
                  <Shield className="w-3 h-3 shrink-0" /> {userRole}
                </span>
              </div>
            </div>
          </div>
          {}
          {userRole === "INSTRUCTOR" && (
            <div className="flex flex-col gap-4 border-b border-border pb-6">
              <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider text-left">Meeting Recording Permissions</h4>
              <div className="flex flex-col sm:flex-row items-start sm:items-center text-left justify-between bg-custom-gray border border-border rounded-soft p-4 gap-4 sm:gap-2">
                <div className="flex flex-col sm:pr-4">
                  <p className="text-sm font-semibold text-foreground">Allow Students to Record</p>
                  <p className="text-xs text-muted-foreground mt-1 sm:mt-0.5">
                    If toggled off, the recording button will be removed and disabled for all students in your meetings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleRecording(!allowStudentRecording)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    allowStudentRecording ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      allowStudentRecording ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>
          )}
          {}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs sm:text-sm font-semibold text-destructive uppercase tracking-wider text-center sm:text-left">Danger Zone</h4>
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left justify-between bg-destructive/10 border border-destructive/20 rounded-soft p-4 gap-4 sm:gap-2">
              <div className="flex flex-col sm:pr-4">
                <p className="text-sm font-semibold text-foreground">Delete Account</p>
                <p className="text-xs text-muted-foreground mt-1 sm:mt-0.5">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto flex items-center justify-center gap-2 shrink-0 shadow-soft"
                disabled={isPending}
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                {isPending ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-soft border border-destructive/30 bg-card backdrop-blur-2xl p-6 shadow-2xl flex flex-col gap-6 w-[92vw] sm:w-full">
          <DialogHeader className="text-center sm:text-left">
            <DialogTitle className="text-xl font-bold text-destructive flex items-center justify-center sm:justify-start gap-2">
              <Trash2 className="w-5 h-5 shrink-0" /> Confirm Account Deletion
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              Are you absolutely sure you want to permanently delete your account? This action cannot be undone and will immediately purge all your profile data and active sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-border pt-4 w-full">
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              disabled={isPending}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-soft"
              disabled={isPending}
              onClick={handleConfirmDelete}
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              {isPending ? "Deleting..." : "Yes, Delete My Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default AvatarSec;
