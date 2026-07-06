import { StudentsStats } from "./StudentsStats";
import { StudentsFilters } from "./StudentsFilters";
import { getDashboardData, getAllStudents } from "../actions/dashboard-actions";
import { GROUP_COLORS } from "@/src/features/dashboard-instructor/groups/constants/groups-constants";
import { format } from "date-fns";
import { Student, StudentGroup } from "../types";

export async function StudentsList() {
  const [dataRes, studentsRes] = await Promise.all([
    getDashboardData(),
    getAllStudents()
  ]);
  
  const rawGroups = dataRes.success && dataRes.data ? dataRes.data : [];
  const allStudents = studentsRes.success && studentsRes.data ? studentsRes.data : [];

  const studentGroups: StudentGroup[] = rawGroups.map((g: any, index: number) => ({
    id: g.id,
    name: g.name,
    color: GROUP_COLORS[index % GROUP_COLORS.length] || "bg-primary",
    memberCount: g.enrollments?.length || 0,
  }));

  const studentMap = new Map<string, Student>();

  // Base list: all students
  allStudents.forEach((s: any) => {
    studentMap.set(s.id, {
      id: s.id,
      name: s.name,
      email: s.email,
      avatar: s.avatarUrl,
      groups: [],
      enrolledDate: "Not Enrolled",
      lastActive: "Never",
      isActive: false,
      totalMeetings: 0,
      avgEngagement: 0,
    });
  });

  // Overlay group and enrollment data
  rawGroups.forEach((g: any, index: number) => {
    const groupColor = GROUP_COLORS[index % GROUP_COLORS.length] || "bg-primary";
    
    g.enrollments?.forEach((enrollment: any) => {
      const s = enrollment.student;
      
      if (!studentMap.has(s.id)) {
        studentMap.set(s.id, {
          id: s.id,
          name: s.name,
          email: s.email,
          avatar: s.avatarUrl,
          groups: [],
          enrolledDate: "Not Enrolled",
          lastActive: "Never",
          isActive: false,
          totalMeetings: 0,
          avgEngagement: 0,
        });
      }

      const existing = studentMap.get(s.id)!;

      if (existing.enrolledDate === "Not Enrolled") {
        existing.enrolledDate = format(new Date(enrollment.joinedAt || g.created_at || new Date()), "MMM d, yyyy");
      }

      // Try to find the last active date from sessions or meetings
      const lastSession = s.sessions?.[0]?.lastUsedAt;
      const lastMeeting = s.meetingParticipants?.length > 0 
        ? s.meetingParticipants.reduce((latest: Date | null, p: any) => {
            const joinedAt = p.joinedAt ? new Date(p.joinedAt) : null;
            if (!latest) return joinedAt;
            return joinedAt && joinedAt > latest ? joinedAt : latest;
          }, null)
        : null;

      const lastActiveDate = lastSession ? new Date(lastSession) : lastMeeting;
      
      if (lastActiveDate) {
         existing.lastActive = format(lastActiveDate, "MMM d, h:mm a");
         existing.isActive = (new Date().getTime() - lastActiveDate.getTime() < 24 * 60 * 60 * 1000);
      }

      const totalMeetings = s.meetingParticipants?.length || 0;
      if (totalMeetings > 0) {
         existing.totalMeetings = totalMeetings;
         // Only average meetings that actually have engagement data (ignores 1-min dropped meetings)
         const validMeetings = s.meetingParticipants.filter((p: any) => p.avgEngagementScore !== null);
         if (validMeetings.length > 0) {
           const sumEngagement = validMeetings.reduce((acc: number, p: any) => acc + p.avgEngagementScore, 0);
           existing.avgEngagement = Math.round(sumEngagement / validMeetings.length);
         } else {
           existing.avgEngagement = 0; // Or keep it 0 if they have no valid meetings
         }
      }

      if (!existing.groups.some(existingGroup => existingGroup.name === g.name)) {
        existing.groups.push({ name: g.name, color: groupColor });
      }
    });
  });

  const students = Array.from(studentMap.values());

  const stats = {
    total: students.length,
    active: students.filter((s) => s.isActive).length,
    groups: studentGroups.length,
    avgEngagement: students.length > 0 
       ? Math.round(students.reduce((acc, s) => acc + s.avgEngagement, 0) / students.length)
       : 0,
  };

  return (
    <>
      {/* Stats */}
      <StudentsStats stats={stats} />

      {/* Client-side interactive filters */}
      <StudentsFilters
        groups={studentGroups}
        students={students}
      />
    </>
  );
}