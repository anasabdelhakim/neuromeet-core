import OTPForm from '@/src/app/(auth)/verify-email/otp-form';
import { getOtpSecondsRemaining } from '@/src/lib/auth-cookies';

export default async function Otp() {
  // This fetch now happens independently
  const initialSeconds = await getOtpSecondsRemaining();

  return <OTPForm initialSecondsRemaining={initialSeconds} />;
}
