"use client";

import React, { useState } from "react";
import { Video, ShieldCheck, Loader } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useRouter } from "next/navigation";
import { getUserProfile, setRedirectCookie } from "@/src/features/auth/actions/auth-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";

export const QuickJoin = () => {
  const [meetingCode, setMeetingCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingCode.trim() || isLoading) return;

    setIsLoading(true);
    try {
      let cleanLink = meetingCode.trim();

      // Handle raw meeting room links or local paths
      if (cleanLink.includes("room=")) {
        const roomMatch = cleanLink.match(/room=([^&]+)/);
        if (roomMatch) cleanLink = roomMatch[1];
      }

      let targetUrl = `/livekit?room=${cleanLink}`;
      try {
        const url = new URL(cleanLink);
        targetUrl = url.pathname + url.search;
      } catch {
        // If not a full URL, treat as room code
      }

      // Validate authentication status
      const user = await getUserProfile();
      if (!user) {
        // Save the redirect path securely in a cookie before going to auth pages
        await setRedirectCookie(targetUrl);
        router.push("/sign-in");
        return;
      }

      router.push(targetUrl);
    } catch (err) {
      console.error("Auth check failed:", err);
      router.push("/sign-in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto mb-20 max-sm:mb-4">
      <Card variant="gradient">
        <CardHeader className="text-center pb-4">
          <CardDescription className="font-medium text-lg text-muted-foreground mb-1">
            Quick Join
          </CardDescription>
          <CardTitle className="text-3xl font-bold text-foreground">
            Join a Meeting Instantly
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleJoin}
            className="relative mb-4 flex items-center bg-input rounded-full border transition-all duration-fast ease-standard p-1 focus-within:ring-2 focus-within:ring-ring  focus-within:ring-offset-background"
          >
            <Input
              type="text"
              placeholder="Enter meeting code or link"
              className="w-full border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 shadow-none px-4 sm:text-lg h-10"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="bg-foreground text-background rounded-full px-3 md:px-4 max-sm:px-3 py-5 font-semibold shrink-0 text-sm gap-1.5"
              disabled={!meetingCode.trim() || isLoading}
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Video className="size-5" strokeWidth={2.5} />
              )}
              <span className="max-sm:hidden text-base">
                {isLoading ? "Joining..." : "Join Now"}
              </span>
            </Button>
          </form>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <span>Active session required to enter</span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
