"use client";

import { useActionState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";

import { forgetPasswordSchema } from "@/src/validations/zod";
import { forgotPasswordAction } from "@/src/features/auth/actions/auth-actions";
import type { ActionResult } from "@/src/features/auth/actions/auth-actions";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/components/ui/field";

export default function ForgetPasswordPreview() {
  const {
    register,
    reset,
    getValues,
    formState: { isSubmitted, errors, touchedFields },
  } = useForm<z.infer<typeof forgetPasswordSchema>>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const [state, action, pending] = useActionState<ActionResult, FormData>(
    forgotPasswordAction,
    { success: false, errorMessage: {} },
  );

  const handleAction = (formData: FormData) => {
    reset(getValues(), { keepValues: true });
    action(formData);
  };

  const showEmailError = !!errors.email && (isSubmitted || touchedFields.email);

  // 2. ADDED: Extract register so we can safely wrap it
  const { onBlur: emailOnBlur, ...emailRest } = register("email");

  return (
    <Card variant="gradient">
      <CardContent>
        <form action={handleAction} className="space-y-4">
          {/* SERVER ERROR */}
          {state.errorMessage?.server && (
            <div className="animate-alert-entrance">
              <p className="text-destructive text-sm text-center bg-destructive-soft rounded-medium py-2 px-3">
                {state.errorMessage.server[0]}
              </p>
            </div>
          )}

          {/* EMAIL FIELD */}
          <div>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoFocus
                placeholder="johndoe@mail.com"
                autoComplete="email"
                className="transition-all focus:ring-2 focus:ring-primary-soft-subtle"
                disabled={pending}
                {...emailRest}
                required
                onBlur={(e) => {
                  if (e.target.value.trim() !== "") {
                    emailOnBlur(e);
                  }
                }}
                aria-invalid={showEmailError}
              />
              <FieldError>
                {(showEmailError
                  ? errors?.email?.message
                  : null) || state.errorMessage.email?.[0]}
              </FieldError>
              <FieldDescription>
                We&apos;ll send you a verification code if this email exists.
              </FieldDescription>
            </Field>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="w-full py-5"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  Sending...
                </span>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
