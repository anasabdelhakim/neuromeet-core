import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { instructorGroups } from "../constants";

export function InstructorGroups() {
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
        {instructorGroups.map((group) => (
          <div
            key={group.id}
            className="flex justify-between items-center py-2.5 border-b last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-2 h-2 rounded-full shadow-sm ${group.color}`}
                style={{ color: "inherit" }}
              />
              <span className="text-sm font-medium truncate pr-2">
                {group.name}
              </span>
            </div>
            <span className="text-muted-foreground text-xs font-semibold">
              {group.members}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
