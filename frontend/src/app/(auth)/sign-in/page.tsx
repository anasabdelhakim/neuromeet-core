import { LoginForm } from "./sign-in";

export default async function Page() {
  return (
    <div className="bg-auth-scene flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full flex-col gap-5 items-center max-w-sm z-10 relative animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out fill-mode-both">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#00d2ff] to-[#7e57c2] bg-clip-text text-transparent">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm -mt-2">Sign in to continue to NeuroMeet</p>
        <div className="w-full">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

