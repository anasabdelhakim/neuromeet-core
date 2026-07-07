'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent, DataPacket_Kind } from 'livekit-client';
export interface ParticipantScore {
  participantId: string;
  participantName: string;        // Real display name from LiveKit
  engagementScore: number;
  isDisengaged: boolean;
  label: 'engaged' | 'disengaged';
  ts: number;
  /** Rolling window of the last 12 scores (for sparkline) */
  history: number[];
  /** Accumulated data for analytics syncing */
  cumulativeSum: number;
  cumulativeCount: number;
  totalFlips: number;
  wasDisengaged: boolean;
}
/**
 * useEngagementData
 *
 * Listens to LiveKit Data Channel messages published by the Python AI bot
 * on topic "engagement".
 *
 * Data flow:
 *   Python bot → room.local_participant.publish_data(payload, topic="engagement")
 *     → RoomEvent.DataReceived fires on every connected client
 *       → this hook decodes the JSON and updates React state
 *
 * NO WebSocket, NO NestJS round-trip after the initial bot dispatch.
 * Pure peer-level delivery via LiveKit's reliable data channel.
 *
 * Expected payload shape (from bot.py):
 * {
 *   type: "engagement_update",
 *   participant_id: string,
 *   engagement_score: number,   // 0–1 sigmoid output
 *   is_disengaged: boolean,     // score < 0.50
 *   label: "engaged" | "disengaged",
 *   ts: number                  // Unix ms
 * }
 */
import { syncEngagementStatsAction } from '../features/dashboard-instructor/analytics/actions/analytics-actions';
export function useEngagementData(meetingId?: string) {
  const room = useRoomContext();
  const [scores, setScores] = useState<Record<string, ParticipantScore>>({});
  const handleData = useCallback(
    (
      payload: Uint8Array,
      participant: unknown,
      kind: DataPacket_Kind,
      topic?: string,
    ) => {
      if (topic !== 'engagement') return;
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type !== 'engagement_update') return;
        setScores((prev) => {
          const existing = prev[msg.participant_id] || {
            cumulativeSum: 0,
            cumulativeCount: 0,
            totalFlips: 0,
            wasDisengaged: false
          };
          const history = [
            ...(existing?.history ?? []),
            msg.engagement_score as number,
          ].slice(-12);
          const isDisengaged = msg.is_disengaged;
          const newlyDisengaged = isDisengaged && !existing.wasDisengaged;
          return {
            ...prev,
            [msg.participant_id]: {
              participantId: msg.participant_id,
              participantName: msg.participant_name || msg.participant_id,
              engagementScore: msg.engagement_score,
              isDisengaged,
              label: msg.label,
              ts: msg.ts,
              history,
              cumulativeSum: existing.cumulativeSum + msg.engagement_score,
              cumulativeCount: existing.cumulativeCount + 1,
              totalFlips: existing.totalFlips + (newlyDisengaged ? 1 : 0),
              wasDisengaged: isDisengaged
            },
          };
        });
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
  useEffect(() => {
    if (!meetingId) return;
    const interval = setInterval(() => {
      setScores(currentScores => {
        const stats = Object.values(currentScores).map(s => {
          const avgScore = s.cumulativeCount > 0 ? s.cumulativeSum / s.cumulativeCount : 0;
          return {
            participantIdentity: s.participantName, // the name or email matching the DB
            avgEngagementScore: avgScore,
            adhdFlagged: s.totalFlips > 0 // if they flipped to disengaged at least once
          };
        });
        if (stats.length > 0) {
          syncEngagementStatsAction(meetingId, stats);
        }
        return currentScores;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [meetingId]);
  /** Sorted ascending by score — lowest engagement first (most urgent) */
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
