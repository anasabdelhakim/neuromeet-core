"use client";
import { useActionState, useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { otpFormSchema } from "@/src/validations/zod";
import {
  verifyCodeAction,
  resendCodeAction,
} from "@/src/features/auth/actions/auth-actions";
import type { ActionResult } from "@/src/features/auth/actions/auth-actions";
interface OTPFormProps {
  initialSecondsRemaining: number;
}
export default function OTPForm({ initialSecondsRemaining }: OTPFormProps) {
  const searchParams = useSearchParams();
  const flow = searchParams.get("flow") || "reset";
  const {
    register,
    reset,
    getValues,
    formState: { isSubmitted, errors, touchedFields },
  } = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: "" },
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    verifyCodeAction,
    { success: false, errorMessage: {} },
  );
  const handleAction = (formData: FormData) => {
    reset(getValues(), { keepValues: true });
    action(formData);
  };
  const showOtpError = !!errors.otp && (isSubmitted || touchedFields.otp);
  const { onBlur: otpOnBlur, ...otpRest } = register("otp");
  const [timeLeft, setTimeLeft] = useState(initialSecondsRemaining);
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);
  const handleResend = useCallback(async () => {
    setResending(true);
    setResendError("");
    setResendSuccess("");
    try {
      const result = await resendCodeAction(flow);
      if (result.success) {
        setTimeLeft(result.secondsRemaining ?? 120);
        setResendSuccess("A new verification code has been resent to your email.");
      } else {
        if (result.secondsRemaining && result.secondsRemaining > 0) {
          setTimeLeft(result.secondsRemaining);
        }
        setResendError(result.errorMessage?.server?.[0] || "Failed to resend");
      }
    } finally {
      setResending(false);
    }
  }, []);
  return (
    <Card variant="gradient">
      <CardContent>
        <form action={handleAction} className="space-y-4">
          <input type="hidden" name="flow" value={flow} />
          {}
          {(state.errorMessage?.server || resendError) && (
            <div className="animate-alert-entrance">
              <p className="text-destructive text-sm text-center bg-destructive-soft rounded-medium py-2 px-3">
                {state.errorMessage?.server?.[0] || resendError}
              </p>
            </div>
          )}
          {}
          {resendSuccess && !(state.errorMessage?.server || resendError) && (
            <div className="animate-alert-entrance">
              <p className="text-status-success text-sm text-center bg-status-success-soft rounded-medium py-2 px-3">
                {resendSuccess}
              </p>
            </div>
          )}
          {}
          <div>
            <p className="text-sm text-muted-foreground text-center">
              Enter the 6-digit verification code sent to your email
            </p>
          </div>
          {}
          <div>
            <Field>
              <FieldLabel htmlFor="otp">Verification code</FieldLabel>
              <Input
                id="otp"
                type="text"
                autoFocus
                required
                maxLength={6}
                placeholder="Enter OTP"
                className="transition-all focus:ring-2 focus:ring-primary-soft-subtle text-center text-lg tracking-widest"
                disabled={pending}
                {...otpRest}
                onBlur={(e) => {
                  if (e.target.value.trim() !== "") {
                    otpOnBlur(e);
                  }
                }}
                aria-invalid={showOtpError}
              />
              <FieldError>
                {(showOtpError ? errors.otp?.message : null) ||
                  state.errorMessage.otp?.[0]}
              </FieldError>
            </Field>
          </div>
          {}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="w-full py-5"
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  Verifying...
                </span>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </div>
          {}
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              disabled={resending || timeLeft > 0}
              onClick={handleResend}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            >
              {resending ? (
                <Loader className="animate-spin mr-2" size={14} />
              ) : null}
              Resend Code
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              {timeLeft > 0 ? (
                <>
                  Resend available in:{" "}
                  {Math.floor(timeLeft / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(timeLeft % 60).toString().padStart(2, "0")}
                </>
              ) : (
                "Didn't receive the code? Click resend above."
              )}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
