import { Suspense } from "react";
import { createSupaBaseServerClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileCompletionForm from "./setting-profile";
import { Loader2 } from "lucide-react";

// --- Dynamic part: fetches user data and guards against repeat visits ---
async function ProfileFormWithData() {
  const supabase = await createSupaBaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { avatar_url: true, is_profile_complete: true },
  });

  // One-time guard: if profile is already complete, redirect to home
  if (profile?.is_profile_complete) {
    redirect("/");
  }

  return <ProfileCompletionForm initialAvatarUrl={profile?.avatar_url ?? undefined} />;
}

// --- Static shell: matches the standard auth container layout ---
export default function Page() {
  return (
    <div className="bg-background flex flex-col gap-5 min-h-svh w-full items-center justify-center p-6 md:p-10">
      <h1 className="text-3xl font-semibold">Complete Your Profile</h1>
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <ProfileFormWithData />
        </Suspense>
      </div>
    </div>
  );
}
