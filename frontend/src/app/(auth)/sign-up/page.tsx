import { SignUpForm } from "./sign-up";
import AuthWrapper from "@/src/features/auth/providers/auth-wrapper";
export default async function Page() {
  return (
    <AuthWrapper
      title="Create your account"
      description="Join NeuroMeet and start collaborating"
    >
      <SignUpForm />
    </AuthWrapper>
  );
}
