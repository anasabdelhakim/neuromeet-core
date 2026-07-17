"use client";

import { useMemo } from "react";
import { StudentAnalyticsDTO } from "../actions/analytics-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Clock, Trophy, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import { DataCard } from "@/src/features/dashboard-shared/components/DataCard";

export default function StudentAnalyticsClient({ data }: { data: StudentAnalyticsDTO }) {
  if (!data) {
    return <div className="p-8 text-center text-muted-foreground">No analytics data available yet.</div>;
  }

  const formattedTimeline = useMemo(() => {
    return data.timeline.map(t => ({
      ...t,
      displayDate: format(new Date(t.date), "MMM dd"),
      percent: t.engagement <= 1 && t.engagement > 0 ? Math.round(t.engagement * 100) : Math.round(t.engagement)
    }));
  }, [data.timeline]);

  const engagementPercent = data.kpis.avgEngagement <= 1 && data.kpis.avgEngagement > 0 
    ? Math.round(data.kpis.avgEngagement * 100) 
    : Math.round(data.kpis.avgEngagement);

  const totalMinutesDisplay = data?.kpis.totalMinutes !== undefined 
    ? data.kpis.totalMinutes 
    : Math.round(Number((data.kpis as any).totalHours || 0) * 60);

  return (
    <div className="flex flex-col gap-6 w-full animate-page-entrance">
      <div className="flex justify-between items-start">
        <div className="hidden sm:block">
          <h2 className="text-3xl font-bold tracking-tight">{data.studentName}'s Analytics</h2>
          <p className="text-muted-foreground mt-1">Track {data.studentName}'s attention and learning performance over time.</p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DataCard
          icon={Clock}
          label="Minutes Attended"
          value={`${totalMinutesDisplay} min`}
          colorClass="text-brand-cyan"
          bgClass="bg-brand-cyan/10 border-brand-cyan/20"
        />
        <DataCard
          icon={Activity}
          label="Avg Engagement"
          value={`${engagementPercent}%`}
          colorClass="text-status-success"
          bgClass="bg-status-success/10 border-status-success/20"
        />
        <DataCard
          icon={Trophy}
          label="Meetings Attended"
          value={data.timeline.length}
          colorClass="text-yellow-500"
          bgClass="bg-yellow-500/10 border-yellow-500/20"
        />
        <DataCard
          icon={Lightbulb}
          label="Attention Flips"
          value={data.kpis.totalAdhdFlags}
          colorClass="text-brand-purple"
          bgClass="bg-brand-purple/10 border-brand-purple/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <Card className="col-span-1 lg:col-span-3 bg-black-soft-subtle border-border rounded-soft shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">Focus Timeline</CardTitle>
            <CardDescription>AI-calculated attention span across previous meetings</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedTimeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}%`} 
                  domain={[0, 100]} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-black-soft)', borderColor: 'var(--color-border)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="percent" 
                  name="Focus Score"
                  stroke="var(--color-brand-cyan)" 
                  strokeWidth={3} 
                  activeDot={{ r: 8, fill: "var(--color-brand-cyan)", stroke: "#fff", strokeWidth: 2 }} 
                  dot={{ r: 4, fill: "var(--color-brand-cyan)", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
