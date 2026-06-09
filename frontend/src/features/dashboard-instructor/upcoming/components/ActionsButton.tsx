import { Button } from "@/src/components/ui/button";
import { Copy, NotebookPen, Play } from "lucide-react";

interface ActionsButtonProps {
  isArrived?: boolean;
}

export function ActionsButton({ isArrived = false }: ActionsButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline">
        <Copy size={18} />
        Copy invitation
      </Button>
      {isArrived && (
        <Button variant="live">
          <Play size={18} />
          Join Now
        </Button>
      )}
      <Button variant="ghost" className="border-border">
        <NotebookPen size={18} />
        Prepare
      </Button>
    </div>
  );
}
