import { Button } from "@/src/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import Link from "next/link";
import { ChevronRight, Play, NotebookPen } from "lucide-react";
import { todayMeetings } from "../constants";
import { StatusBar } from "../../upcoming/components/StatusBar";
import { cn } from "@/src/lib/utils";
import { MeetingActionsPopover } from "../../upcoming/components/MeetingActionsPopover";
import { AvatarChain } from "../../constants/avatars";

export function TodaysMeetings() {
  return (
    <section className="mt-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Today's Meetings</h2>
        </div>
        <Link
          href="/dashboard-instructor/meetings"
          className="text-xs font-semibold text-primary-light hover:text-primary flex items-center transition-colors uppercase tracking-wider"
        >
          View all <ChevronRight className="w-3 h-3 ml-0.5" />
        </Link>
      </div>

      {/* List */}
      <div className="space-y-4">
        {todayMeetings.map((meeting) => {
          const isStartingSoon = meeting.status === "Starting Soon";
          const isLive = meeting.status === "Live";

          // Extract the button to a variable so we can place it differently on mobile vs desktop without duplicating code
          const ActionButton = isLive ? (
            <Button variant="live" className="w-full sm:w-auto flex-shrink-0">
              <Play size={16} fill="currentColor" className="mr-2" />
              Start
            </Button>
          ) : (
            <Button variant="ghost" className="w-full sm:w-auto border-border flex-shrink-0">
              <NotebookPen size={18} className="mr-2" />
              Prepare
            </Button>
          );

          return (
            <Card
              key={meeting.id}
              variant={isLive ? "glass" : isStartingSoon ? "gradient" : "default"}
              className={cn(
                "w-full p-4 sm:p-5 flex flex-col gap-4 transition-all duration-normal ease-standard transform-gpu hover:border-primary-hover",
                isLive || isStartingSoon
                  ? "border backdrop-blur-md shadow-hard shadow-black-20"
                  : "bg-black-soft-subtle border shadow-none opacity-80 hover:opacity-100"
              )}
            >
              {/* Row 1: Meeting Info (Left) & Desktop Actions (Right) */}
              <div className="flex items-start sm:items-center justify-between w-full gap-4">
                
                {/* Meeting Info: Always Visible */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base sm:text-lg font-bold text-foreground max-sm:max-w-60 truncate">
                      {meeting.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm font-medium text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
                    <span className="whitespace-nowrap">{meeting.time}</span>
                    {isStartingSoon && (
                      <Badge className="bg-status-warning-soft text-status-warning border border-status-warning-border hover:bg-status-warning-hover uppercase tracking-wider font-bold text-[10px] sm:text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse mr-1.5"></span>
                        Soon
                      </Badge>
                    )}
                    {isLive && (
                      <Badge className="bg-status-live-soft text-status-live border border-status-live-border hover:bg-status-live-hover uppercase tracking-wider font-bold text-[10px] sm:text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse mr-1.5"></span>
                        Live
                      </Badge>
                    )}
                  </CardDescription>
                </div>

                {/* Desktop Actions: Hidden on Mobile */}
                <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                  <AvatarChain />
                  {ActionButton}
       
                </div>
                  <MeetingActionsPopover
                    title={meeting.title}
                    dateTime={meeting.time}
                    variant="active"
                    meetingId={meeting.id}
                  />
              </div>

              {/* Mobile Only: Progress Bar (Rendered above the button) */}
              <div className="sm:hidden px-1 w-full">
                <StatusBar
                  duration={60}
                  isArrived={isLive}
                  timeLabel={isLive ? "Live" : isStartingSoon ? "Starting Soon" : "Later"}
                />
              </div>

              {/* Mobile Only: Action Button (Rendered at the very bottom) */}
              <div className="sm:hidden w-full">
                {ActionButton}
              </div>

              {/* Desktop Only: Progress Bar (Rendered at the bottom of the card) */}
              <div className="hidden sm:block px-1 -mt-1">
                <StatusBar
                  duration={60}
                  isArrived={isLive}
                  timeLabel={isLive ? "Live" : isStartingSoon ? "Starting Soon" : "Later"}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}