"use client";
import { useEngagementData, ParticipantScore } from '@/src/features/livekit/hooks/useEngagementData';
import { TrendingUp, AlertCircle } from "lucide-react";
const DISENGAGEMENT_THRESHOLD = 0.50;
export function EngagementDashboard() {
  const { scores, disengagedCount, averageScore, totalParticipants } =
    useEngagementData();

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-2 gap-2">
        <SummaryCard
          label="Class avg"
          value={averageScore !== null ? `${Math.round(averageScore * 100)}%` : "—"}
          status={
            averageScore === null
              ? "neutral"
              : averageScore < DISENGAGEMENT_THRESHOLD
              ? "error"
              : averageScore < 0.65
              ? "warning"
              : "success"
          }
        />
        <SummaryCard
          label="Students"
          value={`${totalParticipants}`}
          sublabel={disengagedCount > 0 ? `${disengagedCount} need attention` : "All engaged"}
          status={disengagedCount > 0 ? "error" : "success"}
        />
      </div>
      {disengagedCount > 0 && (
        <div className="flex items-center gap-2.5 bg-destructive-soft border border-destructive rounded-card px-3 py-2.5">
          <AlertCircle size={15} className="text-destructive flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-destructive mb-0.5">
              {disengagedCount} student{disengagedCount > 1 ? "s" : ""}{" "}
              {disengagedCount > 1 ? "appear" : "appears"} disengaged
            </p>
            <p className="text-[10px] font-medium text-destructive/80 truncate">
              {scores.filter(s => s.isDisengaged).map(s => s.participantName).join(", ")}
            </p>
          </div>
        </div>
      )}
      {scores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <TrendingUp size={28} className="text-muted-foreground mb-3 opacity-40" />
          <p className="text-sm font-medium text-muted-foreground">Waiting for AI data…</p>
          <p className="text-xs text-muted-foreground opacity-60 mt-1">
            The engagement bot is connecting...
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-0.5">
            Per student
          </p>
          {scores.map((s) => (
            <StudentRow key={s.participantId} score={s} />
          ))}
        </div>
      )}
    </div>
  );
}
type StatusType = "neutral" | "success" | "warning" | "error";
const statusTextClass: Record<StatusType, string> = {
  neutral: "text-muted-foreground",
  success: "text-status-success",
  warning: "text-status-warning",
  error: "text-destructive",
};
interface SummaryCardProps {
  label: string;
  value: string;
  sublabel?: string;
  status: StatusType;
}
function SummaryCard({ label, value, sublabel, status }: SummaryCardProps) {
  return (
    <div className="bg-black-soft-muted border border-border rounded-card px-3 py-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${statusTextClass[status]}`}>{value}</p>
      {sublabel && (
        <p className={`text-[10px] mt-0.5 ${statusTextClass[status]} opacity-80`}>{sublabel}</p>
      )}
    </div>
  );
}
function StudentRow({ score }: { score: ParticipantScore }) {
  const pct = Math.round(score.engagementScore * 100);
  const isAlert = score.isDisengaged;
  const barColor = isAlert ? "bg-destructive" : pct < 65 ? "bg-status-warning" : "bg-status-success";
  const textColor = isAlert ? "text-destructive" : pct < 65 ? "text-status-warning" : "text-status-success";
  return (
    <div
      className={`px-3 py-2.5 rounded-card border transition-colors duration-normal ${
        isAlert ? "border-destructive bg-destructive-soft" : "border-border bg-black-soft-subtle"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isAlert && (
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse flex-shrink-0" />
          )}
          <span className="text-xs font-medium text-white truncate max-w-32">
            {score.participantName}
          </span>
        </div>
        <span className={`text-xs font-bold tabular-nums flex-shrink-0 ${textColor}`}>{pct}%</span>
      </div>
      <div className="w-full bg-border rounded-full h-1 overflow-hidden">
        <div
          className={`h-1 rounded-full transition-all duration-slow ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {score.history.length > 2 && (
        <div className="mt-2 flex items-end gap-px h-3">
          {score.history.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all duration-normal ${
                v < DISENGAGEMENT_THRESHOLD ? "bg-destructive opacity-60" : "bg-status-success opacity-30"
              }`}
              style={{ height: `${Math.max(10, Math.round(v * 100))}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
