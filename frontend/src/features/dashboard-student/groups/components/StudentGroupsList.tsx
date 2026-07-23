import { getStudentGroupsAction } from "../actions/student-groups-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { BookOpen, Users, GraduationCap, Calendar } from "lucide-react";
import { GROUP_COLORS } from "@/src/features/dashboard-instructor/groups/constants/groups-constants";
import { formatEgyptTime } from "@/src/lib/format-date";

type EnrolledGroup = {
  id: string;
  name: string;
  subject?: string;
  description?: string;
  instructor?: { name: string; avatarUrl?: string };
};

type Enrollment = {
  id: string;
  joinedAt: string;
  group: EnrolledGroup;
};

export async function StudentGroupsList() {
  const result = await getStudentGroupsAction();
  const enrollments = result.success && result.data ? result.data : [];

  return (
    <div className="w-full">

      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-soft border-dashed bg-black-soft-subtle">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No classes yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mb-6">
            You haven't joined any groups yet. Wait for your instructor to send you an invitation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(enrollments as Enrollment[]).map((enrollment, idx) => {
            const group = enrollment.group;
            return (
              <Card key={enrollment.id} className="bg-card-gradient border flex flex-col h-full hover:scale-[1.02] transition-transform duration-normal ease-standard group cursor-pointer">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="flex flex-col flex-1 min-w-0 pr-2">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full shadow-soft flex-shrink-0 ${GROUP_COLORS[idx % GROUP_COLORS.length]}`}
                      />
                      <span className="truncate">{group.name}</span>
                    </CardTitle>
                    {group.subject && (
                      <div className="flex items-center text-sm text-muted-foreground mt-2 font-medium">
                        <BookOpen className="w-4 h-4 mr-2 text-primary-light" />
                        {group.subject}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {group.description || "No description provided."}
                  </p>
                  <div className="pt-4 border-t border-border/50 flex flex-col gap-3 mt-auto">
                    <div className="flex items-center justify-between items-center  gap-3 ">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="truncate max-w-[120px]">Inst. {group.instructor?.name || "Unknown"}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground ">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        Joined {formatEgyptTime(new Date(enrollment.joinedAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function StudentGroupsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((id) => (
        <Card key={id} className="bg-card-gradient border flex flex-col h-[180px]">
          <CardHeader className="pb-3 flex flex-row items-start justify-between">
            <div className="flex flex-col gap-3 w-full pr-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-custom-gray animate-pulse" />
                <div className="h-5 w-32 bg-custom-gray animate-pulse rounded" />
              </div>
              <div className="h-4 w-24 bg-custom-gray animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end gap-4">
            <div className="h-3 w-full bg-custom-gray animate-pulse rounded" />
            <div className="h-3 w-2/3 bg-custom-gray animate-pulse rounded" />
            <div className="pt-4 border-t border-border/50 flex justify-between">
              <div className="h-4 w-20 bg-custom-gray animate-pulse rounded" />
              <div className="h-4 w-24 bg-custom-gray animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
