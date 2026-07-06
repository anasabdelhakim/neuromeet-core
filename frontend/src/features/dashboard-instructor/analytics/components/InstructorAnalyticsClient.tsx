"use client";

import { useState, useEffect } from "react";
import { MeetingListDTO, MeetingAnalyticsDTO, getMeetingAnalyticsAction } from "../actions/analytics-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ScatterChart, Scatter, ZAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Clock, Users, Lightbulb, AlertTriangle, ChevronsUpDown, Check } from "lucide-react";
import { format } from "date-fns";
import { DataCard } from "@/src/features/dashboard-shared/components/DataCard";
import { cn } from "@/src/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function InstructorAnalyticsClient({ 
  meetings,
  initialData 
}: { 
  meetings: MeetingListDTO[],
  initialData: MeetingAnalyticsDTO | null
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMeetingId = searchParams.get("meetingId") || 
    (meetings.length > 0 ? [...meetings].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0].id : "");

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(initialMeetingId);
  const [open, setOpen] = useState(false);
  const data = initialData;

  useEffect(() => {
    const meetingIdParam = searchParams.get("meetingId");
    if (meetingIdParam && meetings.some(m => m.id === meetingIdParam)) {
      setSelectedMeetingId(meetingIdParam);
    }
  }, [searchParams, meetings]);

  const handleMeetingSelect = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setOpen(false);
    router.push(`/dashboard-instructor/analytics?meetingId=${meetingId}`);
    router.refresh(); // Forces Next.js to bypass client-cache and pull fresh data
  };

  const engagementPercent = data?.kpis.avgEngagement 
    ? Math.round(data.kpis.avgEngagement * 100) 
    : 0;

  const formattedMatrix = data ? data.studentMatrix.map(s => ({
    ...s,
    engagement: Math.round(s.avgEngagement * 100),
    hours: Math.round(s.totalSeconds / 3600 * 10) / 10
  })) : [];

  return (
    <div className="flex flex-col gap-6 w-full animate-page-entrance">
      <div className="flex justify-between items-start">
        <div className="hidden sm:block">
          <h2 className="text-3xl font-bold tracking-tight">Meeting Analytics</h2>
          <p className="text-muted-foreground mt-1">Select a meeting to view detailed student engagement.</p>
        </div>
        <div className="w-full sm:w-auto">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full sm:w-[350px] justify-between h-10 bg-black-soft-subtle border-border hover:bg-black-soft hover:text-foreground"
              >
                {selectedMeetingId
                  ? (() => {
                      const m = meetings.find((meeting) => meeting.id === selectedMeetingId);
                      return m ? `${m.title} - ${format(new Date(m.startedAt), "MMM dd, yyyy")}` : "Select a meeting...";
                    })()
                  : "Select a meeting..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>}>

            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="end">
              <Command>
                <CommandInput placeholder="Search meetings..." />
                <CommandList>
                  <CommandEmpty>No meeting found.</CommandEmpty>
                  <CommandGroup>
                    {meetings.map((m) => (
                      <CommandItem
                        key={m.id}
                        value={m.title}
                        onSelect={() => handleMeetingSelect(m.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedMeetingId === m.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {m.title} - {format(new Date(m.startedAt), "MMM dd, yyyy")}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-black-soft-subtle border border-border rounded-soft">
          <p className="text-muted-foreground mb-2">No past meetings found.</p>
          <p className="text-sm text-muted-foreground-muted">Hold your first meeting to start seeing analytics!</p>
        </div>
      ) : !data ? (
        <div className="flex justify-center p-12 text-muted-foreground">Failed to load analytics for this meeting.</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <DataCard
              icon={Users}
              label="Participants"
              value={data.kpis.totalParticipants}
              colorClass="text-brand-cyan"
              bgClass="bg-brand-cyan/10 border-brand-cyan/20"
            />
            <DataCard
              icon={Activity}
              label="Avg Focus"
              value={`${engagementPercent}%`}
              colorClass="text-status-success"
              bgClass="bg-status-success/10 border-status-success/20"
            />
            <DataCard
              icon={Clock}
              label="Total Watch Time"
              value={`${data.kpis.totalHours}h`}
              colorClass="text-brand-purple"
              bgClass="bg-brand-purple/10 border-brand-purple/20"
            />
            <DataCard
              icon={Lightbulb}
              label="Attention Flips"
              value={data.kpis.totalAdhdFlags}
              colorClass="text-status-warning"
              bgClass="bg-status-warning/10 border-status-warning/20"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Matrix Scatter Plot */}
            <Card className="col-span-1 lg:col-span-3 bg-black-soft-subtle border-border rounded-soft shadow-none">
              <CardHeader>
                <CardTitle className="text-xl">Student Focus Matrix</CardTitle>
                <CardDescription>Time spent vs. Average Engagement for this meeting</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      type="number" 
                      dataKey="hours" 
                      name="Hours" 
                      unit="h" 
                      stroke="#888888" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="engagement" 
                      name="Focus" 
                      unit="%" 
                      stroke="#888888" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <ZAxis type="number" range={[50, 400]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      contentStyle={{ backgroundColor: 'var(--color-black-soft)', borderColor: 'var(--color-border)', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Scatter name="Students" data={formattedMatrix} fill="var(--color-status-success)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Student List */}
          <Card className="bg-black-soft-subtle border-border rounded-soft shadow-none flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">Student Detail Report</CardTitle>
                <CardDescription>Individual breakdown of attention and flagged behavior for this meeting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formattedMatrix.map((student, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-medium bg-black-soft-muted border border-border/50 hover:bg-black-soft transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-primary flex items-center justify-center text-white font-bold">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{student.name}</h4>
                          <p className="text-xs text-muted-foreground">{Math.round(student.totalSeconds / 60)} mins attended</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{student.engagement}% Avg</p>
                          <div className="w-24 h-1.5 bg-black-soft rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-status-success rounded-full" style={{ width: `${student.engagement}%` }} />
                          </div>
                        </div>
                        {student.adhdFlags > 0 && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-warning/20 text-status-warning text-xs font-medium border border-status-warning/30">
                            <AlertTriangle size={12} />
                            <span>{student.adhdFlags} Flags</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {formattedMatrix.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">No student data available for this meeting.</div>
                  )}
                </div>
              </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}


