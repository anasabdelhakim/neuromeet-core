'use client';

import { useEngagementData, ParticipantScore } from '@/src/hooks/useEngagementData';

// ─── Threshold ────────────────────────────────────────────────────────────────
// Based on CV results: specificity=71%, sensitivity=84%.
// Using 0.45 (not 0.5) reduces false positives per blueprint recommendation.
const DISENGAGEMENT_THRESHOLD = 0.45;

// ─── Root Dashboard ───────────────────────────────────────────────────────────

/**
 * EngagementDashboard
 *
 * Must be rendered inside a <LiveKitRoom> provider.
 * Reads engagement scores from the Python AI bot via the
 * useEngagementData hook (RoomEvent.DataReceived → topic "engagement").
 *
 * Usage:
 *   <LiveKitRoom token={token} serverUrl={LIVEKIT_URL}>
 *     <VideoConference />
 *     <EngagementDashboard />   ← instructor side-panel
 *   </LiveKitRoom>
 */
export function EngagementDashboard() {
  const { scores, disengagedCount, averageScore, totalParticipants } =
    useEngagementData();

  return (
    <div className="p-4 bg-card rounded-panel text-white space-y-3 w-72">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-brand-cyan tracking-wide uppercase">
          Live Engagement
        </h3>
        {disengagedCount > 0 && (
          <span
            className="text-xs bg-destructive-soft border border-destructive text-destructive
                       px-2 py-0.5 rounded-full animate-pulse"
          >
            ⚠️ {disengagedCount} disengaged
          </span>
        )}
      </div>

      {/* ── Class average pill ── */}
      {averageScore !== null && (
        <ClassAveragePill
          average={averageScore}
          total={totalParticipants}
        />
      )}

      {/* ── Per-student rows ── */}
      {scores.length === 0 ? (
        <p className="text-muted-foreground-mid text-xs text-center py-8">
          Waiting for AI bot data…
        </p>
      ) : (
        <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-0.5
                        scrollbar-thin scrollbar-thumb-border">
          {scores.map((s) => (
            <StudentScoreRow key={s.participantId} score={s} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Class Average Pill ────────────────────────────────────────────────────────

function ClassAveragePill({
  average,
  total,
}: {
  average: number;
  total: number;
}) {
  const pct = Math.round(average * 100);
  const color =
    average < DISENGAGEMENT_THRESHOLD
      ? 'text-destructive'
      : average < 0.65
        ? 'text-status-warning'
        : 'text-status-success';

  return (
    <div className="flex items-center justify-between bg-black-soft-muted border border-border
                    rounded-button px-3 py-2">
      <span className="text-xs text-muted-foreground">
        Class avg · {total} student{total !== 1 ? 's' : ''}
      </span>
      <span className={`text-sm font-bold tabular-nums ${color}`}>{pct}%</span>
    </div>
  );
}

// ─── Per-Student Row ───────────────────────────────────────────────────────────

function StudentScoreRow({ score }: { score: ParticipantScore }) {
  const pct = Math.round(score.engagementScore * 100);
  const isAlert = score.isDisengaged;

  const barColor = isAlert
    ? 'bg-destructive'
    : pct < 65
      ? 'bg-status-warning'
      : 'bg-status-success';

  return (
    <div
      className={`px-3 py-2 rounded-card border transition-all duration-normal ${
        isAlert
          ? 'border-destructive-soft bg-destructive-soft shadow-medium'
          : 'border-border bg-black-soft-subtle'
      }`}
    >
      {/* Name + score */}
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium truncate max-w-[130px]">
          {isAlert && (
            <span className="mr-1 animate-bounce inline-block">🔴</span>
          )}
          {score.participantId}
        </span>
        <span
          className={`text-xs font-bold tabular-nums ${
            isAlert ? 'text-destructive' : 'text-status-success'
          }`}
        >
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-slow ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Sparkline — last 12 readings */}
      {score.history.length > 2 && (
        <div className="mt-1.5 flex items-end gap-px h-4">
          {score.history.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-hard transition-all duration-normal ${
                v < DISENGAGEMENT_THRESHOLD
                  ? 'bg-destructive-soft'
                  : 'bg-status-success opacity-40'
              }`}
              style={{ height: `${Math.round(v * 100)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
