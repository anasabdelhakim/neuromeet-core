import ResetPasswordForm from './reset-password';
import AuthWrapper from "@/src/features/auth/providers/auth-wrapper";

export default async function Page() {
  return (
    <AuthWrapper
      title="Set a new password"
      description="Create a strong password you haven't used before"
    >
      <ResetPasswordForm />
    </AuthWrapper>
  );
}
