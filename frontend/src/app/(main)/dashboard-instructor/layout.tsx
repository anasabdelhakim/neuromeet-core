import { TooltipProvider } from "@/src/components/ui/tooltip";
import { InstructorSidebar } from "@/src/features/dashboard-instructor/layout/InstructorSidebar";
import { InstructorTopbar } from "@/src/features/dashboard-instructor/layout/InstructorTopbar";
import { DashboardBackground } from "@/src/features/dashboard-instructor/wrappers/DashboardBackground";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neuro Meeting",
  description: "NeuroMeet is a platform for communication and collaboration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
    <DashboardBackground>
      <div className="flex min-h-screen w-full relative text-foreground flex-col md:flex-row">
        {/* Sidebar/Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:static md:sticky md:top-0 md:h-screen md:bg-transparent md:border-t-0 shrink-0">
          <InstructorSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <div className="sticky top-0 z-30 bg-black-soft-subtle backdrop-blur-md border-b">
            <InstructorTopbar />
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
