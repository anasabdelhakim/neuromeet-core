"use client";

import { useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { AlertOctagon } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md animate-page-entrance">
        <div className="flex justify-center">
          <div className="p-4 bg-destructive-soft border border-destructive/20 rounded-full shadow-soft">
            <AlertOctagon size={48} className="text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">500</h1>
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground">
            We encountered an unexpected error while processing your request. Please try again.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Button onClick={() => reset()} className="w-full sm:w-auto px-6 bg-primary hover:bg-primary-hover text-white h-11 rounded-soft font-medium transition-all shadow-hard">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/sign-in'} variant="outline" className="w-full sm:w-auto px-6 h-11 rounded-soft font-medium transition-all">
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
