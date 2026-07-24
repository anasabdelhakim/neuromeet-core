'use client';
import { useEffect, useState, useCallback, useRef, startTransition } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent, DataPacket_Kind } from 'livekit-client';
export interface ParticipantScore {
  participantId: string;
  participantName: string;        
  engagementScore: number;
  isDisengaged: boolean;
  label: 'engaged' | 'disengaged';
  ts: number;
  history: number[];
  cumulativeSum: number;
  cumulativeCount: number;
  totalFlips: number;
  wasDisengaged: boolean;
}

import { syncEngagementStatsAction } from '@/src/features/dashboard-instructor/analytics/actions/analytics-actions';
export function useEngagementData(meetingId?: string) {
  const room = useRoomContext();
  const [scores, setScores] = useState<Record<string, ParticipantScore>>({});
  const pendingRef = useRef<Record<string, any>>({});

  const handleData = useCallback(
    (
      payload: Uint8Array,
      participant?: unknown,
      kind?: DataPacket_Kind,
      topic?: string,
    ) => {
      if (topic !== 'engagement') return;
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type !== 'engagement_update') return;
        // Accumulate — do NOT call setScores here (batched below)
        pendingRef.current[msg.participant_id] = msg;
      } catch (e) {
        console.error('[useEngagementData] Failed to parse engagement payload', e);
      }
    },
    [],
  );
  useEffect(() => {
    if (!room) return;
    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room, handleData]);
  // Flush pending messages into state once per second (batch all student updates)
  useEffect(() => {
    const flush = setInterval(() => {
      const pending = pendingRef.current;
      if (Object.keys(pending).length === 0) return;
      pendingRef.current = {};
      setScores(prev => {
        const next = { ...prev };
        for (const msg of Object.values(pending)) {
          const existing = prev[msg.participant_id] || { cumulativeSum: 0, cumulativeCount: 0, totalFlips: 0, wasDisengaged: false, history: [] };
          const history = [...(existing.history ?? []), msg.engagement_score as number].slice(-12);
          const isDisengaged = msg.is_disengaged;
          next[msg.participant_id] = {
            participantId: msg.participant_id,
            participantName: msg.participant_name || msg.participant_id,
            engagementScore: msg.engagement_score,
            isDisengaged,
            label: msg.label,
            ts: msg.ts,
            history,
            cumulativeSum: existing.cumulativeSum + msg.engagement_score,
            cumulativeCount: existing.cumulativeCount + 1,
            totalFlips: existing.totalFlips + (isDisengaged && !existing.wasDisengaged ? 1 : 0),
            wasDisengaged: isDisengaged,
          };
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(flush);
  }, []);

  const latestScoresRef = useRef(scores);
  useEffect(() => { latestScoresRef.current = scores; }, [scores]);

  useEffect(() => {
    if (!meetingId) return;
    const interval = setInterval(() => {
      const stats = Object.values(latestScoresRef.current).map(s => {
        const avgScore = s.cumulativeCount > 0 ? s.cumulativeSum / s.cumulativeCount : 0;
        return { participantIdentity: s.participantName, avgEngagementScore: avgScore, adhdFlagged: s.totalFlips > 0 };
      });
      if (stats.length > 0) {
        startTransition(() => { void syncEngagementStatsAction(meetingId, stats); });
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [meetingId]);
  const sortedScores = Object.values(scores).sort(
    (a, b) => a.engagementScore - b.engagementScore,
  );
  const disengagedCount = sortedScores.filter((s) => s.isDisengaged).length;
  const averageScore =
    sortedScores.length > 0
      ? sortedScores.reduce((sum, s) => sum + s.engagementScore, 0) /
        sortedScores.length
      : null;
  return {
    scores: sortedScores,
    disengagedCount,
    averageScore,
    totalParticipants: sortedScores.length,
  };
}
