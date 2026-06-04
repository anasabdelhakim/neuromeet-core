import ForgetPasswordPreview from "./forget-password";

export default async function Page() {
  return (
    <div className="bg-auth-scene flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full flex-col gap-5 items-center max-w-sm z-10 relative">
        <h1 className="text-3xl font-bold tracking-tight bg-brand-gradient bg-clip-text text-transparent">
          Forgot your password?
        </h1>
        <p className="text-muted-foreground text-sm -mt-2 text-center">
          No worries — we&apos;ll send a reset code to your email
        </p>
        <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out fill-mode-both">
          <ForgetPasswordPreview />
        </div>
      </div>
    </div>
  );
}
