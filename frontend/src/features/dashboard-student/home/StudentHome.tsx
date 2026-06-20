import { Suspense } from "react";
import { StudentGroupsList, StudentGroupsListSkeleton } from "@/src/features/dashboard-student/groups/components/StudentGroupsList";

import { HeroClock, HeroClockSkeleton } from "@/src/features/dashboard-shared/components/HeroClock";
import { DataCard } from "@/src/features/dashboard-shared/components/DataCard";
import { CalendarDays, Clock, BookOpen, ChevronRight, Play, Info } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { AvatarChain } from "@/src/features/dashboard-instructor/constants/avatars";
import { StatusBar } from "@/src/features/dashboard-instructor/upcoming/components/StatusBar";
import { todayMeetings } from "@/src/features/dashboard-instructor/home/constants";
import { cn } from "@/src/lib/utils";
import Link from "next/link";

export function StudentHome() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<HeroClockSkeleton />}>
        <HeroClock />
      </Suspense>

      {/* Quick Stats using Shared DataCard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DataCard
          icon={CalendarDays}
          label="Upcoming Meetings"
          value={4}
          colorClass="text-brand-cyan"
          bgClass="bg-brand-cyan/10 border-brand-cyan/20"
        />
        <DataCard
          icon={Clock}
          label="Completed Sessions"
          value={12}
          colorClass="text-status-success"
          bgClass="bg-status-success/10 border-status-success/20"
        />
        <DataCard
          icon={BookOpen}
          label="Recordings Available"
          value={8}
          colorClass="text-status-live"
          bgClass="bg-status-live/10 border-status-live/20"
        />
      </div>



      {/* Upcoming Sessions Section (Styled Identically to Instructor TodaysMeetings) */}
      <section className="mt-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Upcoming Sessions</h2>
          </div>
          <Link
            href="/dashboard-student/upcoming"
            className="text-xs font-semibold text-primary-light hover:text-primary flex items-center transition-colors uppercase tracking-wider"
          >
            View all schedule <ChevronRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        <div className="space-y-4">
          {todayMeetings.map((meeting) => {
            const isStartingSoon = meeting.status === "Starting Soon";
            const isLive = meeting.status === "Live";

            // Student specific actions
            const ActionButton = isLive ? (
              <Button variant="live" className="w-full sm:w-auto flex-shrink-0">
                <Play size={16} fill="currentColor" className="mr-2" />
                Join Now
              </Button>
            ) : (
              <Button variant="ghost" className="w-full sm:w-auto border-border flex-shrink-0" disabled>
                <Info size={18} className="mr-2" />
                Not Started
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
                </div>

                {/* Mobile Only: Progress Bar */}
                <div className="sm:hidden px-1 w-full">
                  <StatusBar
                    duration={60}
                    isArrived={isLive}
                    timeLabel={isLive ? "Live" : isStartingSoon ? "Starting Soon" : "Later"}
                  />
                </div>

                {/* Mobile Only: Action Button */}
                <div className="sm:hidden w-full">
                  {ActionButton}
                </div>

                {/* Desktop Only: Progress Bar */}
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
    </div>
  );
}