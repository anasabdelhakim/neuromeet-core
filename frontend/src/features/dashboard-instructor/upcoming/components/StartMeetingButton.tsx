"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/src/components/ui/button";
import { Play, Loader } from "lucide-react";

export function StartMeetingButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="live"
      className="w-full sm:w-auto"
      disabled={pending}
    >
      {pending ? (
        <Loader size={16} className="mr-1 animate-spin" />
      ) : (
        <Play size={16} fill="currentColor" className="mr-1" />
      )}
      {pending ? "Starting..." : "Start"}
    </Button>
  );
}
