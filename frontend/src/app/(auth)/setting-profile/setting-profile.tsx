"use client";

import { useActionState, useTransition } from "react";
import { Loader } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

import { AvatarUploadControl } from "@/src/features/auth/components/avatar-upload";
import { ProfileSettingsState, updateUserProfile, skipProfileCompletion } from "@/src/features/auth/actions/auth-actions";

export default function ProfileCompletionForm({ initialAvatarUrl }: { initialAvatarUrl?: string }) {

  const [state, action, pending] = useActionState<ProfileSettingsState, FormData>(
    updateUserProfile,
    { success: false, errorMessage: {} },
  );

  const [isSkipping, startTransition] = useTransition();

  const handleSkip = () => {
    startTransition(() => {
      skipProfileCompletion();
    });
  };

  return (
    <Card variant="gradient">
      <CardContent className="pt-6">
        <form action={action} className="space-y-4">
          {}
          <div>
            <AvatarUploadControl
              error={state.errorMessage?.avatar?.[0]}
              disabled={pending || isSkipping}
              initialUrl={initialAvatarUrl}
            />
          </div>

          {}
          {state.errorMessage?.server && (
            <div className="p-3 rounded-card bg-destructive-soft border border-destructive/20 text-destructive text-sm text-center">
              {state.errorMessage.server[0]}
            </div>
          )}

          {}
          <div className="pt-2 space-y-4">
            <Button
              type="submit"
              className="w-full py-5"
              disabled={pending || isSkipping}
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  Saving...
                </span>
              ) : (
                "Save & Continue"
              )}
            </Button>
            <Button
              type="button"
              onClick={handleSkip}
              variant="ghost"
              className="w-full h-auto py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-fast"
              disabled={pending || isSkipping}
            >
              {isSkipping ? "Skipping..." : "Skip for now"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}