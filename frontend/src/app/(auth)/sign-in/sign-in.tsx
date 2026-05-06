"use client";

import { useActionState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { loginFormSchema } from "@/src/validations/zod";
import { AuthTabs } from "@/src/features/auth/components/authTabs";
import { PasswordInput } from "@/src/features/auth/components/password-input";
import { signInAction } from "@/src/features/auth/actions/auth-actions";
import type { ActionResult } from "@/src/features/auth/actions/auth-actions";

export function LoginForm() {
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const [state, action, pending] = useActionState<ActionResult, FormData>(
    signInAction,
    { success: false, errorMessage: {} },
  );

  const { errors } = form.formState;

  const emailRegister = form.register("email");
  const passwordRegister = form.register("password");

  const handleFocusNext =
    (focusNext: "email" | "password") =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        form.setFocus(focusNext);
      }
    };

  return (
    <Card className="card-glass transition-all duration-300 hover:shadow-xl border-border/50 rounded-2xl">
      <AuthTabs activeTab="sign-in" />
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
                placeholder="Enter your Email"
                disabled={pending}
                {...emailRegister}
                onKeyDown={handleFocusNext("password")}
                aria-invalid={!!errors.email}
                required
              />
              <FieldError>
                {errors.email?.message || state.errorMessage.email?.[0]}
              </FieldError>
            </Field>
          </div>

          {/* PASSWORD FIELD */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput
                control={form.control}
                pending={pending}
                registerProps={passwordRegister}
                errorMsg={
                  errors.password?.message || state.errorMessage.password?.[0]
                }
                onKeyDown={handleFocusNext("password")}
              />
              <FieldError>
                {errors.password?.message || state.errorMessage.password?.[0]}
              </FieldError>
            </Field>

            <Link
              href="/forget-password"
              className="inline-block w-full text-right text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-primary transition-colors mt-2"
            >
              Forgot your password?
            </Link>
          </div>

          {/* MAIN SUBMIT BUTTON */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="shadow-lg shadow-primary/30 w-full py-5"
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Signing in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </div>

          {/* DIVIDER & SOCIAL LOGINS */}
          <div className="relative my-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[400ms] fill-mode-both">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-3 flex gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[500ms] fill-mode-both">
            <Button
              type="button"
              variant="outline"
              className="flex-1 py-5 border-border flex items-center justify-center hover:bg-background bg-muted  transition-all group"
              onClick={() => {
                window.location.href =
                  "http://localhost:4000/api/v1/auth/google/sign";
              }}
            >
              <Image
                src="/icons8-google-logo.svg"
                alt="google"
                width={20}
                height={20}
              />
              <span className="ml-2 font-medium">Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex-1 py-5 border-border flex items-center justify-center hover:bg-background bg-muted  transition-all group"
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
