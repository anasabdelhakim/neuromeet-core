import { Metadata } from "next";
import AuthWrapper from "@/src/features/auth/providers/auth-wrapper";
import ProfileCompletionForm from "./setting-profile";

export const metadata: Metadata = {
  title: "Complete Profile",
  description: "Set up your NeuroMeet profile.",
};

export default function Page() {
  return (
    <AuthWrapper
      title="Complete Your Profile"
      description="Upload an avatar so your students and peers can recognize you."
    >
      <ProfileCompletionForm />
    </AuthWrapper>
  );
}
