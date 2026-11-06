import ForgetPasswordPreview from "./forget-password";
import AuthWrapper from "@/src/features/auth/providers/auth-wrapper";

export default async function Page() {
  return (
    <AuthWrapper
      title="Forgot password?"
      description="We'll send a reset code to your email"
      showLogo={true}
    >
      <ForgetPasswordPreview />
    </AuthWrapper>
  );
}
