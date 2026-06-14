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
    <div className="p-4 bg-[hsl(222,20%,8%)] rounded-panel text-white space-y-3 w-72">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-[hsl(220,80%,75%)] tracking-wide uppercase">
          Live Engagement
        </h3>
        {disengagedCount > 0 && (
          <span
            className="text-xs bg-red-900/60 border border-red-500/70 text-red-300
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
        <p className="text-gray-500 text-xs text-center py-8">
          Waiting for AI bot data…
        </p>
      ) : (
        <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-0.5
                        scrollbar-thin scrollbar-thumb-white/10">
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
      ? 'text-red-400'
      : average < 0.65
        ? 'text-yellow-400'
        : 'text-emerald-400';

  return (
    <div className="flex items-center justify-between bg-white/5 border border-white/8
                    rounded-button px-3 py-2">
      <span className="text-xs text-gray-400">
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
    ? 'bg-red-500'
    : pct < 65
      ? 'bg-yellow-500'
      : 'bg-emerald-500';

  return (
    <div
      className={`px-3 py-2 rounded-card border transition-all duration-500 ${
        isAlert
          ? 'border-red-500/50 bg-red-950/30 shadow-red-900/20 shadow-md'
          : 'border-white/8 bg-white/4'
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
            isAlert ? 'text-red-400' : 'text-emerald-400'
          }`}
        >
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Sparkline — last 12 readings */}
      {score.history.length > 2 && (
        <div className="mt-1.5 flex items-end gap-px h-4">
          {score.history.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all duration-500 ${
                v < DISENGAGEMENT_THRESHOLD
                  ? 'bg-red-500/50'
                  : 'bg-emerald-500/40'
              }`}
              style={{ height: `${Math.round(v * 100)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
