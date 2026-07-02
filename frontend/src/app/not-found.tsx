import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { SearchX } from "lucide-react";
import { DashboardBackground } from "@/src/features/dashboard-instructor/wrappers/DashboardBackground";

export default function NotFound() {
  return (
    <DashboardBackground>
      <div className="h-[100dvh] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md animate-page-entrance">
          <div className="flex justify-center">
            <div className="p-4 bg-black-soft-subtle border border-border rounded-full shadow-soft">
              <SearchX size={48} className="text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">404</h1>
            <h2 className="text-xl font-semibold text-foreground">Page Not Found</h2>
            <p className="text-muted-foreground">
              We couldn't find the page you were looking for. It might have been moved or doesn't exist.
            </p>
          </div>
          <Button render={<Link href="/sign-in" />} nativeButton={false} className="w-full bg-primary hover:bg-primary-hover text-white h-11 rounded-soft font-medium transition-all shadow-hard">
            Return to Dashboard
          </Button>
        </div>
      </div>
    </DashboardBackground>
  );
}
