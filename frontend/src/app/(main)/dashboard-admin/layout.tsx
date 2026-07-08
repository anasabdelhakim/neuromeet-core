import { TooltipProvider } from "@/src/components/ui/tooltip";
import { AdminTopbar } from "@/src/features/dashboard-admin/layout/AdminTopbar";
import { DashboardBackground } from "@/src/features/dashboard-instructor/wrappers/DashboardBackground";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage users, monitor system health, and configure NeuroMeet settings.",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <DashboardBackground>
        <div className="flex h-full w-full relative text-foreground flex-col">
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="z-30 bg-black-soft-subtle backdrop-blur-md border-b shrink-0">
              <AdminTopbar />
            </div>

            <main
              id="main-scroll-container"
              className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col gap-5 transform-gpu"
            >
              <div className="max-w-7xl mx-auto w-full flex flex-col gap-5">
                {children}
              </div>
            </main>
          </div>
        </div>
      </DashboardBackground>
    </TooltipProvider>
  );
}