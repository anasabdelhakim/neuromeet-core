import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Group Details",
  description: "View group members and details.",
};
import { notFound } from "next/navigation";
import { getDashboardData } from "@/src/features/dashboard-instructor/home/actions/home-actions";
import { getAllStudents } from "@/src/features/dashboard-instructor/students/actions/students-actions";
import { GroupDetailsClient } from "@/src/features/dashboard-instructor/groups/components/GroupDetailsClient";

type Props = {
  params: Promise<{ groupId: string }>;
};


export default async function GroupDetailsPage({ params }: Props) {
  const resolvedParams = await params;
  const groupId = resolvedParams.groupId;

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

  return (
    <div className="flex flex-col gap-6 animate-page-entrance">
      <GroupDetailsClient group={group} allStudents={allStudents} />
    </div>
  );
}
