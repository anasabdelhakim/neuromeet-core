import ResetPasswordForm from "./reset-password";
import AuthWrapper from "@/src/features/auth/providers/auth-wrapper";

export default async function Page() {
  return (
    <AuthWrapper
      title="Set new password"
      description="Create a password you haven't used before"
      showLogo={true}
    >
      <ResetPasswordForm />
    </AuthWrapper>
  );
}
