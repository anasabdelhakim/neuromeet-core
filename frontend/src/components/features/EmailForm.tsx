"use client";
import { useActionState } from "react";
import { handleEmail } from "@/src/features/auth/actions/handleEmail";

export function EmailForm() {
  const [state, action, pending] = useActionState(handleEmail, {
    errorMassege: "",
    success: false,
  });

  return (
    <form action={action} className="flex flex-col items-center gap-4 w-full max-w-sm">
      <input
        type="email"
        placeholder="Enter your email"
        name="email"
        className="w-full bg-custom-gray/50 hover:bg-custom-gray/80 focus:bg-custom-gray border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 focus:ring-primary shadow-inner"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-custom-gray hover:bg-custom-gray-hover text-foreground font-semibold px-5 py-2.5 rounded-lg border border-white/5 transition-all cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Checking..." : "Check your email"}
      </button>
      {state.errorMassege && (
        <p className="text-red-500">{state.errorMassege}</p>
      )}
      {state.success && (
        <p className="text-green-500">Email sent successfully</p>
      )}
    </form>
  );
}
