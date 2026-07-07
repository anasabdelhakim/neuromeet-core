"use client";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { AlarmClock, Play, Eye } from "lucide-react";
import { calculateMeetingStatus } from "@/src/features/dashboard-instructor/upcoming/helper/time-calc";
interface Props {
  dateTime: string;
}
export function StudentUpcomingActions({ dateTime }: Props) {
  const { isArrived, isStartingSoon } = calculateMeetingStatus(dateTime);
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Badge className="bg-status-live-soft text-status-live border border-status-live-border uppercase tracking-wider font-bold text-[10px]">
        {isStartingSoon && <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse mr-1" />}
        {isArrived ? "Live" : isStartingSoon ? "Soon" : "Upcoming"}
      </Badge>
      {isArrived ? (
        <Button variant="live" className="whitespace-nowrap">
          <Play size={16} fill="currentColor" className="mr-2" />
          Join Now
        </Button>
      ) : (
        <Button variant="outline" className="whitespace-nowrap border-border" disabled>
          <Eye size={16} className="mr-2" />
          Waiting
        </Button>
      )}
    </div>
  );
}