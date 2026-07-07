import { TooltipProvider } from "@/src/components/ui/tooltip";
import { DashboardBackground } from "@/src/features/dashboard-instructor/wrappers/DashboardBackground";
interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
}
export function DashboardLayout({
  children,
  sidebar,
  topbar,
}: DashboardLayoutProps) {
  return (
    <TooltipProvider>
      <DashboardBackground>
        <div className="flex min-h-screen w-full relative text-foreground flex-col md:flex-row">
          {/* Sidebar/Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:static md:sticky md:top-0 md:h-screen md:bg-transparent md:border-t-0 shrink-0">
            {sidebar}
          </div>
          <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
            <div className="sticky top-0 z-30 bg-black-soft-subtle backdrop-blur-md border-b">
              {topbar}
            </div>
            <main
              id="main-scroll-container"
              className="flex-1 p-4 md:p-6 flex flex-col gap-5 transform-gpu"
            >
              {children}
            </main>
          </div>
        </div>
      </DashboardBackground>
    </TooltipProvider>
  );
}