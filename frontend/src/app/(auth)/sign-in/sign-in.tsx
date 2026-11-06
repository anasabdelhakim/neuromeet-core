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
    <div className="w-full flex flex-col gap-3">
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
  <form action={form.action} className="space-y-2">
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
    <Field>
      <FieldLabel htmlFor="email" className="text-xs font-medium text-zinc-300">Email</FieldLabel>
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
        className="h-9 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus:border-primary focus:ring-primary text-sm rounded-lg"
      />
      <FieldError className="text-xs text-destructive">{error}</FieldError>
    </Field>
  );
};

const PasswordField = ({ form }: LoginFormBodyProps) => {
  const { form: rhf, pending, state, isGoogleLoading } = form;
  const error = rhf.formState.errors.password?.message || state.errorMessage?.password?.[0];
  return (
    <Field>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor="password" className="text-xs font-medium text-zinc-300">Password</FieldLabel>
        <Link href="/forget-password" className="text-xs text-zinc-400 hover:text-white transition-colors">
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
    className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg transition-all shadow-xs cursor-pointer"
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
      "w-full h-9 border-white/10 flex items-center justify-center hover:bg-white/10 bg-white/5 text-white text-sm font-medium rounded-lg transition-all",
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
  <p className="text-center text-xs text-zinc-400 pt-0.5">
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
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background/50 rounded-lg border border-border gap-3">
    <div>
      <p className="text-xs font-bold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">
        User: <code className="bg-muted px-1 py-0.5 rounded font-mono text-primary font-semibold">{email}</code>
        <br />
        Pass: <code className="bg-muted px-1 py-0.5 rounded font-mono text-primary font-semibold">{pass}</code>
      </p>
    </div>
    <Button
      type="button"
      variant="outline"
      onClick={() => onFill(role)}
      className="text-xs bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-1.5 px-3 rounded-md transition-colors border border-primary/20 h-9"
    >
      ⚡ Fill {title}
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
  <div className="flex justify-center mt-2">
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary active:text-primary focus:text-primary data-[state=open]:text-primary bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent outline-none focus-visible:outline-none ring-0 focus-visible:ring-0 cursor-pointer select-none transition-none shadow-none"
          >
            <Sparkles size={16} className="text-primary shrink-0" />
            View Demo Credentials
          </button>
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
            Test the platform&apos;s advanced features using these pre-configured accounts.
            <br />
            <br />
            <span className="font-medium text-foreground">Note:</span> If you sign in normally with Google, you will automatically be assigned the <b>Student</b> role by default.
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
