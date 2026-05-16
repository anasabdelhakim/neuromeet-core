import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardDescription } from "@/src/components/ui/card";
import Image from "next/image";
import { LiveTimeDisplay } from "./LiveTimeDisplay";

export function HeroClock() {
  return (
    <Card className="bg-card-gradient p-8 relative overflow-hidden">
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
        <CardDescription className="flex flex-col justify-start items-start relative z-10">
          <LiveTimeDisplay />
        </CardDescription>

        <Badge className="card-glass p-4">
          Upcoming: <span className="text-cyan-400">11:00 AM</span> — System
          Design Lecture
        </Badge>
      </CardContent>
    </Card>
  );
}

export function HeroClockSkeleton() {
  return (
    <Card className="bg-card-gradient p-8 relative w-full h-[256px]">
      <CardContent className="flex flex-col justify-between gap-6 h-full">
        <div className="flex flex-col justify-start items-start relative z-10 gap-4">
          <div className="h-[60px] md:h-[72px] w-[280px] md:w-[350px] bg-white/10 animate-pulse rounded-xl" />
          <div className="h-[28px] w-[180px] bg-white/10 animate-pulse rounded-md" />
        </div>
        
        <div className="h-[52px] w-[300px] bg-white/10 animate-pulse rounded-full mt-auto" />
      </CardContent>
    </Card>
  );
}
