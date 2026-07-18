"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "./button";

interface GlobalErrorViewProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function GlobalErrorView({ error, reset }: GlobalErrorViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-6 text-center animate-fade-in">
      <div className="bg-destructive/10 p-4 rounded-full mb-6">
        <AlertTriangle className="w-10 h-10 text-destructive" />
      </div>
      
      <h2 className="text-2xl font-bold mb-3">Something went wrong</h2>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm leading-relaxed">
        We encountered an issue loading your data. This might be due to a network connection problem or the server is temporarily asleep.
      </p>

      <div className="bg-black-soft-subtle border border-border p-4 rounded-medium max-w-md w-full mb-8 text-left overflow-hidden">
        <p className="text-xs font-mono text-muted-foreground truncate">
          Error: {error.message || "Unknown server error"}
        </p>
      </div>

      <Button 
        onClick={() => reset()} 
        className="gap-2 px-8"
        size="lg"
      >
        <RefreshCcw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );
}
