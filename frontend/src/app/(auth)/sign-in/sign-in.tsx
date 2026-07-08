"use client";
import { useActionState, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
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
    reset,
    getValues,
    setValue, // ✅ Extracted setValue to programmatically update fields
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
  const [isDemoDialogOpen, setIsDemoDialogOpen] = useState(false); // ✅ Added state to close dialog on fill
  const handleAction = (formData: FormData) => {
    action(formData);
  };
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
  const handleFillCredentials = (role: "student" | "instructor") => {
    if (role === "student") {
      setValue("email", "student@neuromeet.anasdev.shop", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      setValue("password", "NeuroMeet#Student26", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    } else {
      setValue("email", "instructor@neuromeet.anasdev.shop", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      setValue("password", "NeuroMeet#Admin2026", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
    setIsDemoDialogOpen(false); // Close dialog after filling
  };
  return (
    <Card variant="gradient">
      <AuthTabs activeTab="sign-in" />
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
          <div>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="Enter your Email"
                disabled={pending || isGoogleLoading}
                {...emailRest}
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
          <div>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput
                control={control as any}
                pending={pending || isGoogleLoading}
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
          <div className="pt-2">
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
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="w-full">
            <Button
              className={cn(
                "w-full py-5 border-border flex items-center justify-center hover:bg-background bg-muted transition-all group",
                (pending || isGoogleLoading) && "pointer-events-none opacity-50 cursor-not-allowed"
              )}
              nativeButton={false}
              render={<a href="/api/auth/google" />}
              variant="outline"
              onClick={() => {
                setIsGoogleLoading(true);
                setTimeout(() => setIsGoogleLoading(false), 3000);
              }}
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
          </div>
          {/* DEMO CREDENTIALS POPUP */}
          <div className="flex justify-center mt-6">
            <Dialog open={isDemoDialogOpen} onOpenChange={setIsDemoDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 gap-2">
                    <Sparkles size={16} />
                    View Demo Credentials
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-primary">
                    <Sparkles size={18} />
                    Demo Access
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Test the platform's advanced features using these pre-configured accounts.
                    <br /><br />
                    <span className="font-medium text-foreground">Note:</span> If you sign in normally with Google, you will automatically be assigned the <b>Student</b> role by default.
                  </p>

                  {/* Instructor Credentials Fill */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background/50 rounded-lg border border-border gap-3">
                    <div>
                      <p className="text-xs font-bold text-foreground">Instructor</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        User: <code className="bg-muted px-1 py-0.5 rounded font-mono text-primary font-semibold">instructor@neuromeet.anasdev.shop</code>
                        <br />
                        Pass: <code className="bg-muted px-1 py-0.5 rounded font-mono text-primary font-semibold">NeuroMeet#Admin2026</code>
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleFillCredentials("instructor")}
                      className="text-xs bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-1.5 px-3 rounded-md transition-colors border border-primary/20 h-9"
                    >
                      ⚡ Fill Instructor
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
