import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { LockKeyhole } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md animate-page-entrance">
        <div className="flex justify-center">
          <div className="p-4 bg-primary-soft-muted border border-primary/20 rounded-full shadow-soft">
            <LockKeyhole size={48} className="text-primary-light" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">401</h1>
          <h2 className="text-xl font-semibold text-foreground">Unauthorized</h2>
          <p className="text-muted-foreground">
            You must be logged in to view this page. Please sign in to continue accessing NeuroMeet.
          </p>
        </div>
        <Button render={<Link href="/sign-in" />} nativeButton={false} className="w-full bg-primary hover:bg-primary-hover text-white h-11 rounded-soft font-medium transition-all shadow-hard">
          Sign In
        </Button>
      </div>
    </div>
  );
}
