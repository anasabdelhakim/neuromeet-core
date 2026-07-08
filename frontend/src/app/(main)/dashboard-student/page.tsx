import { Metadata } from "next";
import { StudentHome } from "@/src/features/dashboard-student/home/StudentHome";

export const metadata: Metadata = {
  title: "Student Home",
  description: "Overview of your classes and upcoming schedule.",
};
export default function StudentDashboardPage() {
  return <StudentHome />;
}