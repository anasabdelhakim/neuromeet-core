import { LoginForm } from "./sign-in";
import AuthWrapper from "@/src/features/auth/providers/auth-wrapper";

export default async function Page() {
  return (
    <AuthWrapper
      showLogo={true}
      title="Welcome back"
      description="Sign in to your account"
    >
      <LoginForm />
    </AuthWrapper>
  );
}
