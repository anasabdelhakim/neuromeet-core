"use client";

import { useActionState, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Control, type FieldValues } from "react-hook-form";
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
import { PasswordInput } from "@/src/features/auth/components/password-input";
import { signInAction, type ActionResult } from "@/src/features/auth/actions/auth-actions";

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const form = useLoginFormState();
  return (
    <div className="w-full flex flex-col gap-4">
      <GoogleAuthButton
        isGoogleLoading={form.isGoogleLoading}
        setIsGoogleLoading={form.setIsGoogleLoading}
        disabled={form.pending}
      />
      <OrDivider />
      <LoginFormBody form={form} />
      <AuthSwitchPrompt
        promptText="Don't have an account?"
        actionText="Sign up"
        actionHref="/sign-up"
      />
      <DemoCredentialsDialog
        isOpen={form.isDemoDialogOpen}
        onOpenChange={form.setIsDemoDialogOpen}
        onFill={form.handleFillCredentials}
      />
    </div>
  );
}

function useLoginFormState() {
  const form = useForm<LoginFormValues>({
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
  const [isDemoDialogOpen, setIsDemoDialogOpen] = useState(false);

  const handleFillCredentials = (role: "student" | "instructor") => {
    if (role === "student") {
      form.setValue("email", "student@neuromeet.anasdev.shop", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      form.setValue("password", "NeuroMeet#Student26", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    } else {
      form.setValue("email", "instructor@neuromeet.anasdev.shop", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      form.setValue("password", "NuMeet#Inst@26", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
    setIsDemoDialogOpen(false);
  };

  return { form, state, action, pending, isGoogleLoading, setIsGoogleLoading, isDemoDialogOpen, setIsDemoDialogOpen, handleFillCredentials };
}

interface LoginFormBodyProps {
  form: ReturnType<typeof useLoginFormState>;
}

const LoginFormBody = ({ form }: LoginFormBodyProps) => (
  <form action={form.action} className="space-y-3.5">
    {form.state.errorMessage?.server && (
      <p className="text-destructive text-sm text-center bg-destructive/10 border border-destructive/20 rounded-md py-1.5 px-3">
        {form.state.errorMessage.server[0]}
      </p>
    )}
    <EmailField form={form} />
    <PasswordField form={form} />
    <SubmitSignInButton pending={form.pending} />
  </form>
);

const EmailField = ({ form }: LoginFormBodyProps) => {
  const { form: rhf, pending, state, isGoogleLoading } = form;
  const { onBlur, ...rest } = rhf.register("email");
  const error = rhf.formState.errors.email?.message || state.errorMessage?.email?.[0];
  return (
    <Field className="gap-2.5">
      <FieldLabel htmlFor="email" className="text-sm font-medium text-zinc-300">Email</FieldLabel>
      <Input
        id="email"
        type="email"
        placeholder="Enter your email"
        disabled={pending || isGoogleLoading}
        {...rest}
        onBlur={(e) => {
          if (e.target.value.trim() !== "") onBlur(e);
        }}
        aria-invalid={!!error}
        required
        autoFocus
        className="h-10 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus:border-primary focus:ring-primary text-sm rounded-lg"
      />
      <FieldError className="text-xs text-destructive">{error}</FieldError>
    </Field>
  );
};

const PasswordField = ({ form }: LoginFormBodyProps) => {
  const { form: rhf, pending, state, isGoogleLoading } = form;
  const error = rhf.formState.errors.password?.message || state.errorMessage?.password?.[0];
  return (
    <Field className="gap-2.5">
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor="password" className="text-sm font-medium text-zinc-300">Password</FieldLabel>
        <Link href="/forget-password" className="text-sm text-zinc-400 hover:text-white transition-colors">
          Forgot password?
        </Link>
      </div>
      <PasswordInput
        control={rhf.control as unknown as Control<FieldValues>}
        pending={pending || isGoogleLoading}
        registerProps={rhf.register("password")}
        errorMsg={error}
      />
      <FieldError className="text-xs text-destructive">{error}</FieldError>
    </Field>
  );
};

const SubmitSignInButton = ({ pending }: { pending: boolean }) => (
  <Button
    type="submit"
    disabled={pending}
    className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg transition-all shadow-xs cursor-pointer"
  >
    {pending ? (
      <span className="flex items-center gap-2">
        <Loader className="animate-spin" size={16} />
        Signing in...
      </span>
    ) : (
      "Sign in"
    )}
  </Button>
);

const GoogleAuthButton = ({
  isGoogleLoading,
  setIsGoogleLoading,
  disabled,
}: {
  isGoogleLoading: boolean;
  setIsGoogleLoading: (value: boolean) => void;
  disabled: boolean;
}) => (
  <Button
    className={cn(
      "w-full h-10 border-white/10 flex items-center justify-center hover:bg-white/10 bg-white/5 text-white text-sm font-medium rounded-lg transition-all",
      (disabled || isGoogleLoading) && "pointer-events-none opacity-50 cursor-not-allowed"
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
        <Loader className="animate-spin text-zinc-400" size={16} />
        <span>Connecting...</span>
      </div>
    ) : (
      <>
        <Image src="/icons8-google-logo.svg" alt="Google" width={16} height={16} />
        <span className="ml-2">Continue with Google</span>
      </>
    )}
  </Button>
);

const OrDivider = () => (
  <div className="relative my-0.5">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t border-white/10" />
    </div>
    <div className="relative flex justify-center text-xs">
      <span className="bg-[#0A0D18] px-3 text-zinc-400">or</span>
    </div>
  </div>
);

const AuthSwitchPrompt = ({
  promptText,
  actionText,
  actionHref,
}: {
  promptText: string;
  actionText: string;
  actionHref: string;
}) => (
  <p className="text-center text-sm text-zinc-400 pt-0.5">
    {promptText}{" "}
    <Link href={actionHref} className="text-white hover:underline font-semibold ml-1">
      {actionText}
    </Link>
  </p>
);

interface CredentialRowProps {
  role: "instructor" | "student";
  title: string;
  email: string;
  pass: string;
  onFill: (role: "student" | "instructor") => void;
}

const CredentialRow = ({ role, title, email, pass, onFill }: CredentialRowProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 bg-background/50 rounded-lg border border-border gap-2 sm:gap-3 w-full min-w-0">
    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold text-foreground">{title}</p>
      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
        <div className="flex items-center gap-1 min-w-0">
          <span className="shrink-0 text-zinc-400">User:</span>
          <code className="bg-muted px-1 py-0.5 rounded font-mono text-primary font-semibold text-[11px] truncate block max-w-[190px] sm:max-w-[220px]" title={email}>
            {email}
          </code>
        </div>
        <div className="flex items-center gap-1 min-w-0">
          <span className="shrink-0 text-zinc-400">Pass:</span>
          <code className="bg-muted px-1 py-0.5 rounded font-mono text-primary font-semibold text-[11px]">
            {pass}
          </code>
        </div>
      </div>
    </div>
    <Button
      type="button"
      variant="outline"
      onClick={() => onFill(role)}
      className="text-xs bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-1 px-2.5 rounded-md transition-colors border border-primary/20 h-8 shrink-0 self-start sm:self-auto cursor-pointer"
    >
      ⚡ Fill
    </Button>
  </div>
);

const DemoCredentialsDialog = ({
  isOpen,
  onOpenChange,
  onFill,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFill: (role: "student" | "instructor") => void;
}) => (
  <div className="flex justify-center mt-2 w-full max-w-full">
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-primary hover:text-primary active:text-primary focus:text-primary data-[state=open]:text-primary bg-transparent outline-none ring-0 cursor-pointer select-none transition-none shadow-none"
          >
            <Sparkles size={15} className="text-primary shrink-0" />
            View Demo Credentials
          </button>
        }
      />
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm sm:max-w-md max-h-[88dvh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary text-base sm:text-lg">
            <Sparkles size={18} />
            Demo Access
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2.5 mt-2">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Test the platform&apos;s advanced features using these pre-configured accounts.
            <br />
            <span className="font-medium text-foreground">Note:</span> Default Google sign-in is assigned the <b>Student</b> role.
          </p>
          <CredentialRow
            role="instructor"
            title="Instructor"
            email="instructor@neuromeet.anasdev.shop"
            pass="NuMeet#Inst@26"
            onFill={onFill}
          />
          <CredentialRow
            role="student"
            title="Student"
            email="student@neuromeet.anasdev.shop"
            pass="NeuroMeet#Student26"
            onFill={onFill}
          />
        </div>
      </DialogContent>
    </Dialog>
  </div>
);
