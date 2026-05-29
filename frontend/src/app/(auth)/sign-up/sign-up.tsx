// src/components/auth/sign-up.tsx
"use client";

import { useActionState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { SignUpFormSchema } from "@/src/validations/zod";
import { AuthTabs } from "@/src/features/auth/components/authTabs";
import { signUpAction } from "@/src/features/auth/actions/auth-actions";
import type { ActionResult } from "@/src/features/auth/actions/auth-actions";
import { PasswordInput } from "@/src/features/auth/components/password-input";
import { PasswordStrengthUI } from "@/src/features/auth/components/password-strength-ui";

export function SignUpForm() {
  const {
    register,
    control,
    setFocus,
    formState: { errors },
  } = useForm<z.infer<typeof SignUpFormSchema>>({
    resolver: zodResolver(SignUpFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [state, action, pending] = useActionState<ActionResult, FormData>(
    signUpAction,
    { success: false, errorMessage: {} },
  );

  const { onBlur: usernameOnBlur, ...usernameRest } = register("username");
  const { onBlur: emailOnBlur, ...emailRest } = register("email");
  const { onBlur: passwordOnBlur, ...passwordRest } = register("password");
  const { onBlur: confirmPasswordOnBlur, ...confirmPasswordRest } = register("confirmPassword");

  const handleFocusNext =
    (field: "username" | "email" | "password" | "confirmPassword") =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setFocus(field);
      }
    };

  return (
    <Card className="card-glass transition-all duration-300 hover:shadow-xl border-border/50 rounded-2xl">
      <AuthTabs activeTab="sign-up" />
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

          {/* USERNAME */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="transition-all focus:ring-2 focus:ring-primary/20"
                disabled={pending}
                {...usernameRest}
                onBlur={(e) => {
                  if (e.target.value.trim() !== "") {
                    usernameOnBlur(e);
                  }
                }}
                aria-invalid={!!errors.username}
                onKeyDown={handleFocusNext("email")}
                required
                autoFocus
              />
              <FieldError>
                {errors.username?.message || state.errorMessage.username?.[0]}
              </FieldError>
            </Field>
          </div>

          {/* EMAIL */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="transition-all focus:ring-2 focus:ring-primary/20"
                disabled={pending}
                {...emailRest}
                onBlur={(e) => {
                  if (e.target.value.trim() !== "") {
                    emailOnBlur(e);
                  }
                }}
                aria-invalid={!!errors.email}
                onKeyDown={handleFocusNext("password")}
                required
              />
              <FieldError>
                {errors.email?.message || state.errorMessage.email?.[0]}
              </FieldError>
            </Field>
          </div>

          {/* PASSWORD */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>

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
                  Password must satisfy all rules below.
                </FieldDescription>
              )}

              <PasswordStrengthUI control={control} error={errors.password} />
            </Field>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 fill-mode-both">
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[500ms] fill-mode-both pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="shadow-lg shadow-primary/30  w-full py-5"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  Signing up...
                </span>
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
