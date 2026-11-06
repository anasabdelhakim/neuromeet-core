import { SignUpForm } from "./sign-up";
import AuthWrapper from "@/src/features/auth/providers/auth-wrapper";

export default async function Page() {
  return (
    <AuthWrapper
      showLogo={true}
      title="Create an account"
      description="Sign up for your NeuroMeet account"
      position="start"
    >
      <SignUpForm />
    </AuthWrapper>
  );
}
