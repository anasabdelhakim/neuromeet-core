"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/src/components/ui/field";

import { resetPasswordSchema } from "@/src/validations/zod";
import { changePasswordAction } from "@/src/features/auth/actions/auth-actions";
import type { ActionResult } from "@/src/features/auth/actions/auth-actions";
import { PasswordInput } from "@/src/features/auth/components/password-input";
import { PasswordStrengthUI } from "@/src/features/auth/components/password-strength-ui";

export default function ResetPasswordForm() {
  const {
    register,
    control,
    setFocus,
    formState: { errors },
  } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const [state, action, pending] = useActionState<ActionResult, FormData>(
    changePasswordAction,
    { success: false, errorMessage: {} },
  );

  const { onBlur: passwordOnBlur, ...passwordRest } = register("password");
  const { onBlur: confirmPasswordOnBlur, ...confirmPasswordRest } = register("confirmPassword");

  const handleFocusNext =
    (field: "password" | "confirmPassword") =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setFocus(field);
      }
    };

  return (
    <Card variant="gradient">
      <CardContent>
        <form action={action} className="space-y-4">
          {/* SERVER ERROR */}
          {state.errorMessage?.server && (
            <div className="animate-alert-entrance">
              <p className="text-destructive text-sm text-center bg-destructive/10 rounded-medium py-2 px-3">
                {state.errorMessage.server[0]}
              </p>
            </div>
          )}

          {/* PASSWORD FIELD */}
          <div className="animate-card-entrance delay-100">
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>

              <PasswordInput
                control={control as any}
                pending={pending}
                registerProps={{
                  ...passwordRest,
                  onBlur: (e: { target: any; type?: any }) => {
                    if (e.target.value !== "") {
                      passwordOnBlur(e);
                    }
                  },
                }}
                errorMsg={
                  errors.password?.message || state.errorMessage.password?.[0]
                }
                onKeyDown={handleFocusNext("confirmPassword")}
              />

              {errors.password?.message || state.errorMessage.password?.[0] ? (
                <FieldError>
                  {errors.password?.message || state.errorMessage.password?.[0]}
                </FieldError>
              ) : (
                <FieldDescription>
                  Your password must satisfy all rules below.
                </FieldDescription>
              )}

              <PasswordStrengthUI control={control} error={errors.password} />
            </Field>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="animate-card-entrance delay-200">
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
              
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="transition-all focus:ring-2 focus:ring-primary/20"
                disabled={pending}
                required
                {...confirmPasswordRest}
                onBlur={(e) => {
                  if (e.target.value.trim() !== "") {
                    confirmPasswordOnBlur(e);
                  }
                }}
                aria-invalid={!!errors.confirmPassword}
                required
              />
              <FieldError>
                {errors.confirmPassword?.message ||
                  state.errorMessage.confirmPassword?.[0]}
              </FieldError>
            </Field>
          </div>

          {/* SUBMIT */}
          <div className="animate-card-entrance delay-300 pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="w-full py-5"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
