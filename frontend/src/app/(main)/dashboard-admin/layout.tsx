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
        <div className="flex min-h-screen w-full relative text-foreground flex-col">
          <div className="flex-1 flex flex-col min-w-0">
            <div className="sticky top-0 z-30 bg-black-soft-subtle backdrop-blur-md border-b">
              <AdminTopbar />
            </div>

            <main
              id="main-scroll-container"
              className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col gap-5 transform-gpu max-w-7xl mx-auto w-full"
            >
              {children}
            </main>
          </div>
        </div>
      </DashboardBackground>
    </TooltipProvider>
  );
}