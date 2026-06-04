"use client";

import React, { useState } from "react";
import { Video, ShieldCheck } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";

export const QuickJoin = () => {
  const [meetingCode, setMeetingCode] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      console.log(`Joining meeting: ${meetingCode}`);
      // Implement join logic here
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto mb-20">
      <Card className="card-glass backdrop-blur-xl border-border/40 border-2 shadow-2xl rounded-2xl">
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
            className="relative mb-4 flex items-center bg-input/10 rounded-full border border-border/30 transition-all p-1 focus-within:ring-2 focus-within:ring-ring  focus-within:ring-offset-background"
          >
            <Input
              type="text"
              placeholder="Enter meeting code or link"
              className="w-full border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 shadow-none px-4 sm:text-lg h-10"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
            />
            <Button
              type="submit"
              className="bg-foreground text-background rounded-full px-6 py-5 font-semibold shrink-0 text-[15px]"
              disabled={!meetingCode.trim()}
            >
              <Video className="size-5" strokeWidth={2.5} />
              Join Now
            </Button>
          </form>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <span>No account required for guests</span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
