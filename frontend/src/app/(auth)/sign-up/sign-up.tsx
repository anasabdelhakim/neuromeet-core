"use client";

import { useActionState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Control, type FieldValues } from "react-hook-form";
import type { z } from "zod";
import { Loader } from "lucide-react";
import Link from "next/link";
import { SignUpFormSchema } from "@/src/validations/zod";
import { PasswordInput } from "@/src/features/auth/components/password-input";
import { PasswordStrengthUI } from "@/src/features/auth/components/password-strength-ui";
import { signUpAction, type ActionResult } from "@/src/features/auth/actions/auth-actions";

type SignUpFormValues = z.infer<typeof SignUpFormSchema>;

export function SignUpForm() {
  const formState = useSignUpFormState();
  return (
    <div className="w-full flex flex-col gap-4">
      <SignUpFormBody formState={formState} />
      <SignUpSwitchPrompt />
    </div>
  );
}

function useSignUpFormState() {
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  });
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    signUpAction,
    { success: false, errorMessage: {} }
  );
  return { form, state, action, pending };
}

interface SignUpFormBodyProps {
  formState: ReturnType<typeof useSignUpFormState>;
}

const SignUpFormBody = ({ formState }: SignUpFormBodyProps) => (
  <form action={formState.action} className="space-y-3.5">
    {formState.state.errorMessage?.server && (
      <p className="text-destructive text-sm text-center bg-destructive/10 border border-destructive/20 rounded-md py-1 px-3">
        {formState.state.errorMessage.server[0]}
      </p>
    )}
    <NameField formState={formState} />
    <EmailField formState={formState} />
    <PasswordField formState={formState} />
    <ConfirmPasswordField formState={formState} />
    <SubmitSignUpButton pending={formState.pending} />
  </form>
);

const NameField = ({ formState }: SignUpFormBodyProps) => {
  const { form, pending, state } = formState;
  const { onBlur, ...rest } = form.register("username");
  const error = form.formState.errors.username?.message || state.errorMessage?.username?.[0];
  return (
    <Field className="gap-2.5">
      <FieldLabel htmlFor="username" className="text-sm font-medium text-zinc-300">Name</FieldLabel>
      <Input
        id="username"
        type="text"
        placeholder="Jane Doe"
        disabled={pending}
        {...rest}
        onBlur={(e) => { if (e.target.value.trim() !== "") onBlur(e); }}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); form.setFocus("email"); } }}
        aria-invalid={!!error}
        required
        autoFocus
        className="h-10 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus:border-primary focus:ring-primary text-sm rounded-lg"
      />
      <FieldError className="text-xs text-destructive">{error}</FieldError>
    </Field>
  );
};

const EmailField = ({ formState }: SignUpFormBodyProps) => {
  const { form, pending, state } = formState;
  const { onBlur, ...rest } = form.register("email");
  const error = form.formState.errors.email?.message || state.errorMessage?.email?.[0];
  return (
    <Field className="gap-2.5">
      <FieldLabel htmlFor="email" className="text-sm font-medium text-zinc-300">Email</FieldLabel>
      <Input
        id="email"
        type="email"
        placeholder="you@example.com"
        disabled={pending}
        {...rest}
        onBlur={(e) => { if (e.target.value.trim() !== "") onBlur(e); }}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); form.setFocus("password"); } }}
        aria-invalid={!!error}
        required
        className="h-10 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus:border-primary focus:ring-primary text-sm rounded-lg"
      />
      <FieldError className="text-xs text-destructive">{error}</FieldError>
    </Field>
  );
};

const PasswordField = ({ formState }: SignUpFormBodyProps) => {
  const { form, pending, state } = formState;
  const rest = form.register("password");
  const error = form.formState.errors.password?.message || state.errorMessage?.password?.[0];
  return (
    <Field className="gap-2.5">
      <FieldLabel htmlFor="password" className="text-sm font-medium text-zinc-300">Password</FieldLabel>
      <PasswordInput
        control={form.control as unknown as Control<FieldValues>}
        pending={pending}
        registerProps={rest}
        errorMsg={error}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); form.setFocus("confirmPassword"); } }}
      />
      <FieldError className="text-xs text-destructive">{error}</FieldError>
      <PasswordStrengthUI control={form.control} error={form.formState.errors.password} />
    </Field>
  );
};

const ConfirmPasswordField = ({ formState }: SignUpFormBodyProps) => {
  const { form, pending, state } = formState;
  const { onBlur, ...rest } = form.register("confirmPassword");
  const error = form.formState.errors.confirmPassword?.message || state.errorMessage?.confirmPassword?.[0];
  return (
    <Field className="gap-2.5">
      <FieldLabel htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">Confirm Password</FieldLabel>
      <Input
        id="confirmPassword"
        type="password"
        placeholder="Confirm password"
        disabled={pending}
        {...rest}
        onBlur={(e) => { if (e.target.value.trim() !== "") onBlur(e); }}
        aria-invalid={!!error}
        required
        className="h-10 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus:border-primary focus:ring-primary text-sm rounded-lg"
      />
      <FieldError className="text-xs text-destructive">{error}</FieldError>
    </Field>
  );
};

const SubmitSignUpButton = ({ pending }: { pending: boolean }) => (
  <Button
    type="submit"
    disabled={pending}
    className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-sm transition-all mt-1"
  >
    {pending ? (
      <span className="flex items-center gap-2">
        <Loader className="animate-spin" size={16} />
        Signing up...
      </span>
    ) : (
      "Sign up"
    )}
  </Button>
);

const SignUpSwitchPrompt = () => (
  <p className="text-center text-sm text-zinc-400 pt-0.5">
    Already have an account?{" "}
    <Link href="/sign-in" className="text-white hover:underline font-semibold ml-1">
      Sign in
    </Link>
  </p>
);
