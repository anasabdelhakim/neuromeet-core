import { Card, CardDescription, CardTitle } from "@/src/components/ui/card";
import { AvatarChain } from "@/src/features/dashboard-instructor/constants/Avtars-meetings";
import { Clock, CheckCircle2, BarChart3, Play } from "lucide-react";
import { PreviousMeeting } from "../types";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

interface PreviousMeetingCardProps {
  meeting: PreviousMeeting;
}

export function PreviousMeetingCard({ meeting }: PreviousMeetingCardProps) {
  const attendancePercentage = Math.round(
    (meeting.attendeesCount / meeting.totalStudents) * 100,
  );

  return (
    <Card className="w-full rounded-lg p-5 flex flex-col gap-4  border   transition-all duration-300 transform-gpu hover:border-primary/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        {/* Left Side: Content */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-lg font-bold text-foreground truncate">
              {meeting.title}
            </CardTitle>
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 uppercase tracking-wider font-bold text-[10px] py-0.5 px-2 flex items-center gap-1">
              <CheckCircle2 size={10} />
              Completed
            </Badge>
            {meeting.hasRecording && (
              <Badge className="bg-destructive/10 text-destructive border border-destructive/20 uppercase tracking-wider font-bold text-[10px] py-0.5 px-2">
                Recording Available
              </Badge>
            )}
          </div>
          <CardDescription className="text-sm font-medium text-muted-foreground flex flex-wrap items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-primary-light" />
              <span>{meeting.dateTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground/30">•</span>
              <span>{meeting.duration} Mins Duration</span>
            </div>
          </CardDescription>
        </div>

        {/* Right Side: Actions & Avatars */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="hidden sm:block">
            <AvatarChain />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border rounded-sm">
              <BarChart3 size={18} className="text-primary-light" />
              <span>Report</span>
            </Button>
            {meeting.hasRecording && (
              <Button className="border rounded-sm">
                <Play size={18} fill="currentColor" />
                <span>Play</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Attendance Progress Bar */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-muted-foreground">Attendance Rate</span>
          <span className="text-emerald-400">
            {meeting.attendeesCount}/{meeting.totalStudents} (
            {attendancePercentage}%) attended
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
            style={{ width: `${attendancePercentage}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
