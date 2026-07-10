import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getDashboardData } from "@/src/features/dashboard-instructor/home/actions/home-actions";
import { getAllStudents } from "@/src/features/dashboard-instructor/students/actions/students-actions";
import { GroupDetailsClient } from "@/src/features/dashboard-instructor/groups/components/GroupDetailsClient";

export const metadata: Metadata = {
  title: "Group Details",
  description: "View group members and details.",
};

type Props = {
  params: Promise<{ groupId: string }>;
};

async function GroupDetailsData({ groupId }: { groupId: string }) {
  const [dashboardRes, studentsRes] = await Promise.all([
    getDashboardData(),
    getAllStudents()
  ]);

  if (!dashboardRes.success || !dashboardRes.data) {
    notFound();
  }

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
      <Suspense 
        fallback={
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <GroupDetailsData groupId={groupId} />
      </Suspense>
    </div>
  );
}
