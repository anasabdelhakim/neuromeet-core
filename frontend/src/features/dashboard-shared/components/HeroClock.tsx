
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardDescription } from "@/src/components/ui/card";
import Image from "next/image";
import { ServerTimeDisplay } from "./LiveTimeDisplay";

interface HeroClockProps {
  showUpcoming?: boolean;
  upcomingMeeting?: {
    time: string;
    title: string;
  } | null;
}

export function HeroClock({ showUpcoming = true, upcomingMeeting }: HeroClockProps) {
  return (
    <Card variant="gradient" className="sm:py-6 sm:px-4 py-4 px-0 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-background.webp"
          alt="Hero Background"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 75vw"
          className="object-cover transform-gpu"
        />
      </div>
      <CardContent className="flex flex-col justify-between gap-6 max-sm:gap-3 relative z-10">
        <CardDescription className="flex flex-col justify-start items-start relative z-10 w-full">
          <ServerTimeDisplay />
        </CardDescription>

        {showUpcoming && upcomingMeeting && (
          <>
            <Badge className="max-sm:hidden backdrop-blur-xl border border-white-soft-muted bg-upcoming-badge p-4">
              Upcoming: <span className="text-primary-light mx-1">{upcomingMeeting.time}</span> —
              <span className="ml-1">{upcomingMeeting.title}</span>
            </Badge>
            <Badge className="sm:hidden backdrop-blur-xl border border-white-soft-muted bg-upcoming-badge p-4">
              Upcoming: <span className="text-primary-light ml-1">{upcomingMeeting.time}</span>
            </Badge>
            <Badge className="sm:hidden backdrop-blur-xl border border-white-soft-muted bg-upcoming-badge p-4">
              {upcomingMeeting.title}
            </Badge>
          </>
        )}
        {showUpcoming && !upcomingMeeting && (
          <Badge className="backdrop-blur-xl border border-white-soft-muted bg-upcoming-badge p-4 text-muted-foreground font-medium">
            No upcoming meetings scheduled
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export function HeroClockSkeleton() {
  return (
    <Card variant="gradient" className="sm:py-6 sm:px-4 py-4 px-4 relative w-full h-56 sm:h-64 overflow-hidden">
      <CardContent className="flex flex-col justify-between gap-6 max-sm:gap-3 h-full relative z-10">
        <div className="flex flex-col justify-start items-start relative z-10 gap-2 sm:gap-4 w-full">
          <div className="h-12 sm:h-16 w-48 sm:w-72 md:w-80 bg-white-soft-muted animate-pulse rounded-soft" />
          <div className="h-6 sm:h-7 w-32 sm:w-44 bg-white-soft-muted animate-pulse rounded-medium" />
        </div>
        <div className="h-12 w-full sm:w-72 bg-white-soft-muted animate-pulse rounded-medium mt-auto" />
      </CardContent>
    </Card>
  );
}
