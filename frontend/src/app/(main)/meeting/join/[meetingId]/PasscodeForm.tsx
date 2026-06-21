"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Shield, Loader2, KeyRound } from "lucide-react";
import { joinMeetingAction } from "@/src/features/dashboard-student/upcoming/actions/student-meeting-actions";

interface PasscodeFormProps {
  meetingId: string;
  meetingTitle: string;
}

export function PasscodeForm({ meetingId, meetingTitle }: PasscodeFormProps) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError("Please enter the meeting passcode.");
      return;
    }

    setIsLoading(true);
    setError("");

    const res = await joinMeetingAction(meetingId, passcode);
    // If joinMeetingAction succeeds, it calls redirect() and this code won't run.
    // If it returns, it means there was an error.
    if (res && !res.success) {
      setError(res.errorMessage);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <Label htmlFor="passcode" className="text-sm font-medium text-muted-foreground">
          Meeting Passcode
        </Label>
        <div className="relative">
          <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="passcode"
            type="text"
            inputMode="numeric"
            placeholder="Enter 6-digit passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="bg-black-soft-muted h-12 pl-10 pr-4 rounded-soft text-center text-lg tracking-[0.3em] font-mono"
            maxLength={10}
            autoFocus
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-status-error text-center">{error}</p>
      )}

      <Button
        type="submit"
        disabled={isLoading || !passcode.trim()}
        className="w-full h-12 text-base font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Shield size={18} className="mr-2" />
            Join Meeting
          </>
        )}
      </Button>
    </form>
  );
}
