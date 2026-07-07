import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getGroupsAction } from "../../groups/actions/groups-actions";
import { GROUP_COLORS } from "../../groups/constants/groups-constants";
export async function InstructorGroups() {
  const result = await getGroupsAction();
  const groups = result.success && result.data ? result.data.slice(0, 3) : []; // Show top 3
  return (
    <Card className="bg-card-gradient h-full p-5 flex flex-col border w-full">
      <CardHeader className="px-0 pt-0 pb-3 flex items-center justify-between">
        <CardTitle className="text-lg font-bold">Groups</CardTitle>
        <Link
          href="/dashboard-instructor/groups"
          className="text-xs font-semibold text-primary-light hover:text-primary flex items-center transition-colors uppercase tracking-wider"
        >
          View all <ChevronRight className="w-3 h-3 ml-0.5" />
        </Link>
      </CardHeader>
      <CardContent className="px-0 pb-0 flex-1 flex flex-col justify-start">
        {groups.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            No groups created yet.
          </div>
        ) : (
          groups.map((group: any, idx: number) => (
            <div
              key={group.id}
              className="flex justify-between items-center py-2.5 border-b last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-2 h-2 rounded-full shadow-soft ${GROUP_COLORS[idx % GROUP_COLORS.length]}`}
                  style={{ color: "inherit" }}
                />
                <span className="text-sm font-medium truncate pr-2">
                  {group.name}
                </span>
              </div>
              <span className="text-muted-foreground text-xs font-semibold">
                {group._count?.enrollments || 0} students
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
export function InstructorGroupsSkeleton() {
  return (
    <Card className="bg-card-gradient h-full p-5 flex flex-col border w-full">
      <CardHeader className="px-0 pt-0 pb-3 flex items-center justify-between">
        <CardTitle className="text-lg font-bold">Groups</CardTitle>
        <div className="h-4 w-16 bg-custom-gray animate-pulse rounded" />
      </CardHeader>
      <CardContent className="px-0 pb-0 flex-1 flex flex-col justify-start">
        {[1, 2, 3].map((id) => (
          <div key={id} className="flex justify-between items-center py-2.5 border-b last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-custom-gray animate-pulse" />
              <div className="h-4 w-32 bg-custom-gray animate-pulse rounded" />
            </div>
            <div className="h-3 w-16 bg-custom-gray animate-pulse rounded" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
