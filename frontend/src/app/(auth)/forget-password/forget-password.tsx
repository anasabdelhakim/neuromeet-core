"use client";

// 1. ADDED: useState import
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
  const form = useForm<z.infer<typeof forgetPasswordSchema>>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const [state, action, pending] = useActionState<ActionResult, FormData>(
    forgotPasswordAction,
    { success: false, errorMessage: {} },
  );

  const { isSubmitted, errors, touchedFields } = form.formState;
  const showEmailError = !!errors.email && (isSubmitted || touchedFields.email);

  // 2. ADDED: Extract register so we can safely wrap it
  const emailRegister = form.register("email");

  return (
    <Card className="card-glass transition-all duration-300 hover:shadow-xl border-border/50 rounded-2xl">
      <CardContent>
        <form action={action} className="space-y-4">
          {/* SERVER ERROR */}
          {state.errorMessage?.server && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-destructive text-sm text-center bg-destructive/10 rounded-md py-2 px-3">
                {state.errorMessage.server[0]}
              </p>
            </div>
          )}

          {/* EMAIL FIELD */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="johndoe@mail.com"
                autoComplete="email"
                className="transition-all focus:ring-2 focus:ring-primary/20"
                disabled={pending}
                {...emailRegister}
                aria-invalid={showEmailError}
              />
              <FieldError>
                {(showEmailError
                  ? form.formState.errors?.email?.message
                  : null) || state.errorMessage.email?.[0]}
              </FieldError>
              <FieldDescription>
                We&apos;ll send you a verification code if this email exists.
              </FieldDescription>
            </Field>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="shadow-lg shadow-primary/30 w-full py-5"
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
