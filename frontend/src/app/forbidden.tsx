import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md animate-page-entrance">
        <div className="flex justify-center">
          <div className="p-4 bg-status-warning-soft border border-status-warning-border rounded-full shadow-soft">
            <ShieldAlert size={48} className="text-status-warning" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">403</h1>
          <h2 className="text-xl font-semibold text-foreground">Access Forbidden</h2>
          <p className="text-muted-foreground">
            You do not have the necessary permissions to view this page. If you believe this is an error, please contact your administrator.
          </p>
        </div>
        <Button render={<Link href="/sign-in" />} className="w-full bg-primary hover:bg-primary-hover text-white h-11 rounded-soft font-medium transition-all shadow-hard">
          Return to Login
        </Button>
      </div>
    </div>
  );
}
