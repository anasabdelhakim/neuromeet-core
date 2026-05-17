import { Button } from "@/src/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { AvatarChain } from "@/src/features/dashboard-instructor/constants/Avtars-meetings";
import Link from "next/link";
import { ChevronRight, Play, NotebookPen } from "lucide-react";
import { todayMeetings } from "../constants";
import { StatusBar } from "../../upcoming/components/StatusBar";

export function TodaysMeetings() {
  return (
    <section className="mt-5">
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
      <div className="space-y-3">
        {todayMeetings.map((meeting) => {
          const isStartingSoon = meeting.status === "Starting Soon";
          const isLive = meeting.status === "Live";

          return (
            <Card
              key={meeting.id}
              className={`w-full rounded-xl p-5 flex flex-col gap-4 transition-all duration-300 transform-gpu hover:border-primary/50 ${
                isLive
                  ? "card-glass border  backdrop-blur-md shadow-lg shadow-black/20"
                  : isStartingSoon
                    ? "bg-card-gradient border  backdrop-blur-md shadow-lg shadow-black/20"
                    : "bg-black/20 border  shadow-none opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg font-bold text-white">
                      {meeting.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm font-medium text-white/50 flex flex-wrap items-center gap-2 mt-1">
                    <span>{meeting.time}</span>
                    {isStartingSoon && (
                      <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 uppercase tracking-wider font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Soon
                      </Badge>
                    )}
                    {isLive && (
                      <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 uppercase tracking-wider font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                        Live
                      </Badge>
                    )}
                  </CardDescription>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-4">
                  <AvatarChain />
                  {isLive ? (
                    <Button className="live-btn">
                      <Play size={16} fill="currentColor" />
                      Join Now
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="border-border rounded-sm"
                    >
                      <NotebookPen size={18} />
                      Prepare
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-1 -mt-4">
                <StatusBar
                  duration={60}
                  isArrived={isLive}
                  timeLabel={
                    isLive ? "Live" : isStartingSoon ? "Starting Soon" : "Later"
                  }
                />
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
