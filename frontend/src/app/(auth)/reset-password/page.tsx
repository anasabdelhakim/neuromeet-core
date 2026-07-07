import ResetPasswordForm from './reset-password';
import AuthWrapper from "@/src/features/auth/providers/auth-wrapper";
export default async function Page() {
  return (
    <AuthWrapper
      title="Set new password"
      description="Create password you haven't used before"
    >
      <ResetPasswordForm />
    </AuthWrapper>
  );
}
