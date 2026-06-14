"use client";

import { useActionState, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { loginFormSchema } from "@/src/validations/zod";
import { AuthTabs } from "@/src/features/auth/components/authTabs";
import { PasswordInput } from "@/src/features/auth/components/password-input";
import { signInAction } from "@/src/features/auth/actions/auth-actions";
import type { ActionResult } from "@/src/features/auth/actions/auth-actions";

export function LoginForm() {
  const {
    register,
    control,
    setFocus,
    formState: { errors },
  } = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const [state, action, pending] = useActionState<ActionResult, FormData>(
    signInAction,
    { success: false, errorMessage: {} }
  );

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ✅ Extract onBlur from RHF register so we can control when it fires
  const { onBlur: emailOnBlur, ...emailRest } = register("email");
  const { onBlur: passwordOnBlur, ...passwordRest } = register("password");

  const handleFocusNext =
    (focusNext: "email" | "password") =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setFocus(focusNext);
      }
    };

  return (
    <Card variant="gradient">
      <AuthTabs activeTab="sign-in" />
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


          <div className="animate-card-entrance delay-100">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="Enter your Email"
                disabled={pending || isGoogleLoading}
                {...emailRest}
                // ✅ Let TypeScript infer the event type naturally here
                onBlur={(e) => {
                  if (e.target.value.trim() !== "") {
                    emailOnBlur(e);
                  }
                }}
                onKeyDown={handleFocusNext("password")}
                aria-invalid={!!errors.email}
                required
                autoFocus
              />
              <FieldError>
                {errors.email?.message || state.errorMessage.email?.[0]}
              </FieldError>
            </Field>
          </div>

          <div className="animate-card-entrance delay-200">
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput
                // ✅ Cast control as any to satisfy PasswordInput's generic boundaries
                control={control as any}
                pending={pending || isGoogleLoading}
                registerProps={{
                  ...passwordRest,
                  // ✅ Match RHF's ChangeHandler parameter type exactly
                  onBlur: (e: { target: any; type?: any }) => {
                    if (e.target.value !== "") {
                      passwordOnBlur(e);
                    }
                  },
                }}
                errorMsg={
                  errors.password?.message || state.errorMessage.password?.[0]
                }
              />
              <FieldError>
                {errors.password?.message || state.errorMessage.password?.[0]}
              </FieldError>
            </Field>
            <div className="flex justify-end w-full">
              <Link
                href="/forget-password"
                className="inline-block text-right text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-primary transition-colors mt-2"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* MAIN SUBMIT BUTTON */}
          <div className="animate-card-entrance delay-300 pt-2">
            <Button
              type="submit"
              disabled={pending || isGoogleLoading}
              className="w-full py-5"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  Signing in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </div>

          {/* DIVIDER & SOCIAL LOGINS */}
          <div className="relative my-6 animate-card-entrance delay-400">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-3 flex gap-2 animate-card-entrance delay-500">
            <Button
              className="flex-1 py-5 border-border flex items-center justify-center hover:bg-background bg-muted transition-all group"
              nativeButton={false}
              render={<a href="/api/auth/google" />}
              variant="outline"
              disabled={pending || isGoogleLoading}
              onClick={() => setIsGoogleLoading(true)}
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-2">
                  <Loader
                    className="animate-spin text-muted-foreground"
                    size={20}
                  />
                  <span>Google...</span>
                </div>
              ) : (
                <>
                  <Image
                    src="/icons8-google-logo.svg"
                    alt="google"
                    width={20}
                    height={20}
                  />
                  <span className="ml-2 font-medium">Google</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={pending || isGoogleLoading}
              className="flex-1 py-5 border-border flex items-center justify-center hover:bg-background bg-muted transition-all group"
            >
              <Image src="/apple-32.png" alt="apple" width={21} height={21} />
              <span className="ml-2 font-medium">Apple</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}