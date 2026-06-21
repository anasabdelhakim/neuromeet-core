import { getGroupsAction } from "../actions/groups-actions";
import { getAllStudents } from "@/src/features/dashboard-instructor/students/actions/students-actions";
import { GROUP_COLORS } from "../constants/groups-constants";
import { Group } from "../types/groups-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { CreateGroupModal } from "./CreateGroupModal";
import { GroupCardActions } from "./GroupCardActions";
import { Users, BookOpen, Plus } from "lucide-react";
import { AvatarChain } from "../../constants/avatars";
import { AssignStudentModal } from "./AssignStudentModal";
import { AssignStudentButton } from "./AssignStudentButton";
import Link from "next/link";

export async function GroupsList() {
  const [groupsResult, studentsResult] = await Promise.all([
    getGroupsAction(),
    getAllStudents()
  ]);
  

  const groups: Group[] = groupsResult.success && groupsResult.data ? groupsResult.data : [];
  const allStudents = studentsResult.success && studentsResult.data ? studentsResult.data : [];

  return (
    <div className="w-full">

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-soft border-dashed">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No groups found</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mb-6">
            You haven't created any groups yet. Create one to start managing your students.
          </p>
          <CreateGroupModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, idx) => {
            const mappedAvatars = (group.enrollments || []).map((e: any) => ({
              alt: e.student?.name || "Unknown",
              initials: e.student?.name ? e.student.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "??",
              src: e.student?.avatarUrl,
              color: "bg-primary-soft-muted",
            }));

            return (
            <Card key={group.id} className="bg-card-gradient border flex flex-col h-full hover:scale-[1.02] hover:shadow-soft transition-all duration-normal ease-standard relative overflow-hidden group">
              <Link href={`/dashboard-instructor/groups/${group.id}`} className="absolute inset-0 z-0" />
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 relative z-10">
                <div className="flex flex-col flex-1 min-w-0 pr-2 pointer-events-none">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full shadow-soft flex-shrink-0 ${GROUP_COLORS[idx % GROUP_COLORS.length]}`}
                    />
                    <span className="truncate">{group.name}</span>
                  </CardTitle>
                  {group.subject && (
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <BookOpen className="w-4 h-4 mr-1.5" />
                      {group.subject}
                    </div>
                  )}
                </div>
                <GroupCardActions group={group} />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {group.description || "No description provided."}
                </p>
                <div className="pt-4 border-t flex flex-row items-end justify-between mt-auto relative z-10">
                  <div className="flex flex-col items-start w-auto">
                    <span className="text-xs text-muted-foreground mb-2">Students ({group._count?.enrollments || 0})</span>
                    <div className="flex items-center">
                      <AvatarChain avatars={mappedAvatars} max={4} />
                    </div>
                  </div>
                  
                  <AssignStudentButton groupId={group.id} />
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
      
      <AssignStudentModal groups={groups} allStudents={allStudents} />
    </div>
  );
}
