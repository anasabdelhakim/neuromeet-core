import Image from "next/image";
import { dummyRecordings } from "../constants/dummy-recordings";
import { Recording } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/src/components/ui/card";
import { Clock, Download, Play, ShareIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { TooltipButton } from "@/src/components/providers/TooltipButton";

// Import your new Client Component (adjust the path if you placed it elsewhere)

export const RecordingsList = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
      {dummyRecordings.map((recording) => (
        <RecordingCard key={recording.id} recording={recording} />
      ))}
    </div>
  );
};

export function RecordingCard({ recording }: { recording: Recording }) {
  return (
    <Card className="bg-card-gradient rounded-lg py-0 cursor-pointer hover:scale-103 transition-all duration-300 group">
      <div className="aspect-video overflow-hidden rounded-t-lg relative">
        <Image
          src={recording.image}
          alt={recording.title}
          width={400}
          height={225}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Play className="text-white w-10 h-10 fill-white" />
        </div>

        <Badge className="absolute z-20 top-2 left-2 flex items-center gap-1 bg-custom-gray border-border shadow-lg">
          {/* Animated Recording Dot */}
          <span className="relative flex h-2 w-2 mr-0.5 ">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
          </span>
          <span>Record</span>
        </Badge>
        <Badge className="absolute z-20 bottom-2 right-2 flex items-center gap-1 bg-custom-gray border-border shadow-lg rounded-sm tracking-wider">
          <Clock size={12} />
          <span>{recording.duration}min</span>
        </Badge>
      </div>
      <CardContent>
        <CardTitle>{recording.title}</CardTitle>
        <CardDescription className="my-2">{recording.dateTime}</CardDescription>

        <div className="flex gap-2 mt-3 border-t border-border py-3 px-0 justify-between items-center w-full">
          <div className="flex gap-2">
            <TooltipButton
              label="Delete recording"
              variant="destructive"
              className="rounded-sm"
            >
              <Trash2Icon size={18} />
            </TooltipButton>

            <TooltipButton
              label="Download"
              variant="outline"
              className="rounded-sm"
            >
              <Download size={18} />
            </TooltipButton>

            <TooltipButton
              label="Share"
              variant="outline"
              className="rounded-sm"
            >
              <ShareIcon size={18} />
            </TooltipButton>
          </div>

          <TooltipButton label="Play recording" className="rounded-sm gap-2">
            <Play size={18} />
            Play
          </TooltipButton>
        </div>
      </CardContent>
    </Card>
  );
}
