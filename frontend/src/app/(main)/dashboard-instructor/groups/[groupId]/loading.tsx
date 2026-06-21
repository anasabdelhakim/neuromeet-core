import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-page-entrance w-full h-full min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader className="w-8 h-8 animate-spin text-primary" />
        <p>Loading group details...</p>
      </div>
    </div>
  );
}
