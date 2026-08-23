import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import { LucideIcon } from "lucide-react";

export interface DataCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  colorClass: string;
  bgClass: string;
}

export function DataCard({ icon: Icon, label, value, colorClass, bgClass }: DataCardProps) {
  return (
    <Card className="p-5 max-sm:py-3 max-sm:px-4 flex flex-col gap-4 bg-black-soft-subtle border-border hover:border-border transition-colors duration-normal rounded-soft relative overflow-hidden group">
      <div
        className={cn(
          "absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity",
          bgClass
        )}
      />

      <div className="flex items-center justify-between z-10">
        <div
          className={cn(
            "w-10 h-10 rounded-medium flex items-center justify-center border",
            bgClass,
            colorClass
          )}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>

      <div className="z-10 flex flex-col gap-1">
        <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {value}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </p>
      </div>
    </Card>
  );
}
