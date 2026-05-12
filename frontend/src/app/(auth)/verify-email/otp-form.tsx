"use client";

import { useActionState, useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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

  const form = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: "" },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const [state, action, pending] = useActionState<ActionResult, FormData>(
    verifyCodeAction,
    { success: false, errorMessage: {} },
  );

  const { isSubmitted, errors, touchedFields } = form.formState;
  const showOtpError = !!errors.otp && (isSubmitted || touchedFields.otp);

  const otpRegister = form.register("otp");

  // SECURITY: Timer state is seeded from a server-computed value (HTTP-only cookie).
  // The client only counts down from whatever the server told it — no localStorage,
  // no client-side timestamp that an attacker could edit in DevTools.
  const [timeLeft, setTimeLeft] = useState(initialSecondsRemaining);
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState("");

  // Countdown effect — purely cosmetic, the real enforcement is server-side
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // SECURITY: On resend, the server action checks the HTTP-only cookie.
  // Even if someone bypasses the disabled button, the server will reject
  // the request and return the real remaining seconds.
  const handleResend = useCallback(async () => {
    setResending(true);
    setResendError("");
    try {
      const result = await resendCodeAction(flow);
      if (result.success) {
        setTimeLeft(result.secondsRemaining ?? 120);
      } else {
        // If the server says "wait N seconds", sync the timer to that value
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
    <Card className="card-glass transition-all duration-300 hover:shadow-xl border-border/50 rounded-2xl">
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="flow" value={flow} />

          {/* SERVER ERROR */}
          {(state.errorMessage?.server || resendError) && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-destructive text-sm text-center bg-destructive/10 rounded-md py-2 px-3">
                {state.errorMessage?.server?.[0] || resendError}
              </p>
            </div>
          )}

          {/* INFO */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75 fill-mode-both">
            <p className="text-sm text-muted-foreground text-center">
              Enter the 6-digit verification code sent to your email
            </p>
          </div>

          {/* OTP FIELD */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
            <Field>
              <FieldLabel htmlFor="otp">Verification code</FieldLabel>
              <Input
                id="otp"
                type="text"
                autoFocus
                maxLength={6}
                placeholder="Enter OTP"
                className="transition-all focus:ring-2 focus:ring-primary/20 text-center text-lg tracking-widest"
                disabled={pending}
                {...otpRegister}
                aria-invalid={showOtpError}
              />
              <FieldError>
                {(showOtpError ? errors.otp?.message : null) ||
                  state.errorMessage.otp?.[0]}
              </FieldError>
            </Field>
          </div>

          {/* VERIFY BUTTON */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="shadow-lg shadow-primary/30 w-full py-5"
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Verifying...
                </span>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </div>

          {/* RESEND & TIMER */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both text-center">
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
                <Loader2 className="animate-spin mr-2" size={14} />
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
