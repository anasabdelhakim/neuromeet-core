import { Suspense } from 'react';
import { Loader } from 'lucide-react';
import Otp from '@/src/features/auth/components/otp';
import AuthWrapper from "@/src/features/auth/providers/auth-wrapper";
export default function OTPPage() {
  return (
    <AuthWrapper
      title="Check your inbox"
      description="Enter the 6-digit code sent to your email"
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-96">
            <Loader className="animate-spin" size={24} />
          </div>
        }
      >
        <Otp />
      </Suspense>
    </AuthWrapper>
  );
}
