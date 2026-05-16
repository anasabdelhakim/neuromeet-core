import { Button } from "@/src/components/ui/button";
import { Copy, NotebookPen, Play } from "lucide-react";

interface ActionsButtonProps {
  isArrived?: boolean;
}

export function ActionsButton({ isArrived = false }: ActionsButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" className="rounded-sm font-semibold">
        <Copy size={18} />
        Copy invitation
      </Button>
      {isArrived && (
        <Button className="rounded-sm font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 hover:scale-105 border-0 transition-all duration-300">
          <Play size={18} />
          Join Now
        </Button>
      )}
      <Button variant="ghost" className="border rounded-sm border-white/10">
        <NotebookPen size={18} />
        Prepare
      </Button>
    </div>
  );
}
