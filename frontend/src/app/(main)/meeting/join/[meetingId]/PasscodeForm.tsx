"use client";

import { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(true);

  // Attempt seamless auto-join if they already have a saved session passcode
  useEffect(() => {
    const autoJoin = async () => {
      const savedPasscode = sessionStorage.getItem(`passcode_${meetingId}`);
      if (!savedPasscode) {
        setIsLoading(false);
        return;
      }
      
      const res = await joinMeetingAction(meetingId, savedPasscode);
      if (res && !res.success) {
        sessionStorage.removeItem(`passcode_${meetingId}`);
        setError(res.errorMessage);
        setIsLoading(false);
      }
    };
    
    autoJoin();
  }, [meetingId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError("Please enter the meeting passcode.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Save optimistically. If the server action redirects on success, this persists.
    sessionStorage.setItem(`passcode_${meetingId}`, passcode);

    const res = await joinMeetingAction(meetingId, passcode);
    
    if (res && !res.success) {
      // If it failed, remove the invalid passcode and show the error
      sessionStorage.removeItem(`passcode_${meetingId}`);
      setError(res.errorMessage);
      setIsLoading(false);
    }
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
