import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getDashboardData } from "@/src/features/dashboard-instructor/home/actions/home-actions";
import { getAllStudents } from "@/src/features/dashboard-instructor/students/actions/students-actions";
import { GroupDetailsClient } from "@/src/features/dashboard-instructor/groups/components/GroupDetailsClient";
import { Loader } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ groupId: string }>;
};

async function GroupDataLoader({ groupId }: { groupId: string }) {
  // Fetch all data for the page
  const [dashboardRes, studentsRes] = await Promise.all([
    getDashboardData(),
    getAllStudents()
  ]);

  if (!dashboardRes.success || !dashboardRes.data) {
    notFound();
  }

  // Find the specific group
  const group = dashboardRes.data.find((g: any) => g.id === groupId);
  
  if (!group) {
    notFound();
  }

  const allStudents = studentsRes.success && studentsRes.data ? studentsRes.data : [];

  return <GroupDetailsClient group={group} allStudents={allStudents} />;
}

export default async function GroupDetailsPage({ params }: Props) {
  const resolvedParams = await params;
  const groupId = resolvedParams.groupId;

  return (
    <div className="flex flex-col gap-6 animate-page-entrance">
      <Suspense fallback={<div className="flex justify-center items-center h-40"><Loader className="w-8 h-8 animate-spin text-primary" /></div>}>
        <GroupDataLoader groupId={groupId} />
      </Suspense>
    </div>
  );
}
