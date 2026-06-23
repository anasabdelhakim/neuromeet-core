import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Hammer } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center animate-page-entrance">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-brand-cyan-soft-muted border border-brand-cyan/20 rounded-full shadow-soft animate-pulse">
          <Hammer size={48} className="text-brand-cyan" />
        </div>
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
        Implementing it soon
      </h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
        We are actively working on this feature! It will be available in a future update. Stay tuned for more NeuroMeet enhancements.
      </p>
      <Button render={<Link href="/" />} className="w-full sm:w-auto px-8 bg-primary hover:bg-primary-hover text-white h-11 rounded-soft font-medium transition-all shadow-hard">
        Back to Dashboard
      </Button>
    </div>
  );
}
