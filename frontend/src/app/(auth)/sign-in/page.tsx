import { LoginForm } from "./sign-in";
import AuthWrapper from "@/src/features/auth/providers/auth-wrapper";
export default async function Page() {
  return (
    <AuthWrapper
      title="Welcome back"
      description="Sign in to continue to NeuroMeet"
    >
      <LoginForm />
    </AuthWrapper>
  );
}
