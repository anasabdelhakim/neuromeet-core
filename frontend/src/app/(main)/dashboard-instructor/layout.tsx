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
      <div className="flex min-h-screen w-full relative text-foreground">
        <div className="sticky top-0 h-screen shrink-0 z-40">
          <InstructorSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="sticky top-0 z-30 bg-black/10 backdrop-blur-md border-b">
            <InstructorTopbar />
          </div>

          <main
            id="main-scroll-container"
            className="flex-1 p-6 flex flex-col gap-5 transform-gpu"
          >
            {children}
          </main>
        </div>
      </div>
    </DashboardBackground>
    </TooltipProvider>
  );
}
