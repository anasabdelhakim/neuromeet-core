import { Users, Activity, TrendingUp, Layers } from "lucide-react";
import { DataCard } from "@/src/features/dashboard-shared/components/DataCard";

interface StudentsStatsProps {
  stats: {
    total: number;
    active: number;
    groups: number;
    avgEngagement: number;
  };
}

export function StudentsStats({ stats }: StudentsStatsProps) {
  const statConfig = [
    {
      icon: Users,
      label: "Total Students",
      value: stats.total,
      colorClass: "text-brand-cyan",
      bgClass: "bg-brand-cyan/10 border-brand-cyan/20",
    },
    {
      icon: Activity,
      label: "Active Now",
      value: stats.active,
      colorClass: "text-status-success",
      bgClass: "bg-status-success/10 border-status-success/20",
    },
    {
      icon: TrendingUp,
      label: "Avg Engagement",
      value: `${stats.avgEngagement}%`,
      colorClass: "text-primary-light",
      bgClass: "bg-primary-light/10 border-primary-light/20",
    },
    {
      icon: Layers,
      label: "Groups",
      value: stats.groups,
      colorClass: "text-brand-purple",
      bgClass: "bg-brand-purple/10 border-brand-purple/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statConfig.map((stat) => (
        <DataCard
          key={stat.label}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          colorClass={stat.colorClass}
          bgClass={stat.bgClass}
        />
      ))}
    </div>
  );
}