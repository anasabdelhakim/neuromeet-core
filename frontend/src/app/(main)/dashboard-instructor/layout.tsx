import { TooltipProvider } from "@/src/components/ui/tooltip";
import { InstructorSidebar } from "@/src/features/dashboard-instructor/layout/InstructorSidebar";
import { InstructorTopbar } from "@/src/features/dashboard-instructor/layout/InstructorTopbar";
import { DashboardBackground } from "@/src/features/dashboard-instructor/wrappers/DashboardBackground";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Instructor Dashboard",
  description: "Manage your upcoming meetings, track student engagement, and review analytics.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
    <DashboardBackground>
      <div className="flex h-full w-full relative text-foreground flex-col md:flex-row overflow-hidden">
        <div className="hidden md:block md:static md:sticky md:top-0 md:h-screen md:bg-transparent shrink-0">
          <InstructorSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="z-30 bg-black-soft-subtle backdrop-blur-md border-b shrink-0">
            <InstructorTopbar />
          </div>
          <main
            id="main-scroll-container"
            className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 transform-gpu"
          >
            {children}
          </main>
        </div>
        <div className="md:hidden shrink-0 bg-card border-t border-border w-full z-50 pb-[env(safe-area-inset-bottom)]">
          <InstructorSidebar />
        </div>
      </div>
    </DashboardBackground>
    </TooltipProvider>
  );
}
