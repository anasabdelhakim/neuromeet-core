import { TooltipProvider } from "@/src/components/ui/tooltip";
import { StudentSidebar } from "@/src/features/dashboard-student/layout/StudentSidebar";
import { StudentTopbar } from "@/src/features/dashboard-student/layout/StudentTopbar";
import { DashboardBackground } from "@/src/features/dashboard-instructor/wrappers/DashboardBackground";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <DashboardBackground>
        <div className="flex h-[100dvh] w-full relative text-foreground flex-col md:flex-row overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:block md:static md:sticky md:top-0 md:h-screen md:bg-transparent shrink-0">
            <StudentSidebar />
          </div>

          {/* Right Side Column (Holds Topbar + Scrolling Main Content) */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Topbar (Completely locked at the top of the column, outside the scroll area) */}
            <div className="z-30 bg-black-soft-subtle backdrop-blur-md border-b shrink-0">
              <StudentTopbar />
            </div>

            {/* Main Scrolling Content Area */}
            <main
              id="main-scroll-container"
              className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 transform-gpu"
            >
              {children}
            </main>
          </div>

          {/* Mobile Bottom Navigation (Locked at the bottom of the flex column, completely outside the scroll area) */}
          <div className="md:hidden shrink-0 bg-card border-t border-border w-full z-50">
            <StudentSidebar />
          </div>
        </div>
      </DashboardBackground>
    </TooltipProvider>
  );
}