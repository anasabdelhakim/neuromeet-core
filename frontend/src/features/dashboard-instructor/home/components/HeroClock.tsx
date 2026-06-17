import { Suspense } from "react";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardDescription } from "@/src/components/ui/card";
import Image from "next/image";
import { ServerTimeDisplay } from "@/src/features/dashboard-instructor/home/components/LiveTimeDisplay";

export function HeroClock() {
  return (
    <Card variant="gradient" className="py-6 px-4 relative overflow-hidden">
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
      <CardContent className="flex flex-col justify-between gap-6 relative z-10">
        <CardDescription className="flex flex-col justify-start items-start relative z-10 w-full">
          <Suspense
            fallback={
              <>
                <h1 className="text-6xl font-black tracking-tighter text-white-soft-muted shadow-soft md:text-7xl animate-pulse">
                  --:-- --
                </h1>
                <p className="mt-2 text-lg font-medium text-white-soft-subtle md:text-xl animate-pulse">
                  Loading clock...
                </p>
              </>
            }
          >
            <ServerTimeDisplay />
          </Suspense>
        </CardDescription>

        <Badge className="backdrop-blur-xl border border-white-soft-muted bg-upcoming-badge p-4">
          Upcoming: <span className="text-primary-light">11:00 AM</span> —
          System Design Lecture
        </Badge>
      </CardContent>
    </Card>
  );
}

export function HeroClockSkeleton() {
  return (
    <Card variant="gradient" className="p-8 relative w-full h-64">
      <CardContent className="flex flex-col justify-between gap-6 h-full">
        <div className="flex flex-col justify-start items-start relative z-10 gap-4">
          <div className="h-16 w-72 md:w-80 bg-white-soft-muted animate-pulse rounded-soft" />
          <div className="h-7 w-44 bg-white-soft-muted animate-pulse rounded-medium" />
        </div>

        <div className="h-12 w-72 bg-white-soft-muted animate-pulse rounded-full mt-auto" />
      </CardContent>
    </Card>
  );
}
