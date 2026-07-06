"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/src/components/ui/button";
import { Play, Loader } from "lucide-react";
import { startMeetingAction } from "../../home/actions/meeting-actions";

function SubmitButton() {
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

export function StartMeetingForm({ meetingId }: { meetingId: string }) {
  const actionWithId = startMeetingAction.bind(null, meetingId);
  const [state, action] = useActionState(actionWithId, { success: true, errorMessage: "" });

  return (
    <form action={action} className="w-full sm:w-auto flex flex-col gap-1 items-end sm:items-start">
      <SubmitButton />
      {!state.success && state.errorMessage && (
        <span className="text-destructive text-xs font-medium max-w-[150px] text-right sm:text-left leading-tight">
          {state.errorMessage}
        </span>
      )}
    </form>
  );
}
