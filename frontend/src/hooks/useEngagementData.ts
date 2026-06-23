'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent, DataPacket_Kind } from 'livekit-client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParticipantScore {
  participantId: string;
  engagementScore: number;
  isDisengaged: boolean;
  label: 'engaged' | 'disengaged';
  ts: number;
  /** Rolling window of the last 12 scores (for sparkline) */
  history: number[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

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
 *   is_disengaged: boolean,     // score < 0.45
 *   label: "engaged" | "disengaged",
 *   ts: number                  // Unix ms
 * }
 */
export function useEngagementData() {
  const room = useRoomContext();
  const [scores, setScores] = useState<Record<string, ParticipantScore>>({});

  const handleData = useCallback(
    (
      payload: Uint8Array,
      participant?: unknown,
      kind?: DataPacket_Kind,
      topic?: string,
    ) => {
      // Only process messages on the "engagement" topic
      if (topic !== 'engagement') return;

      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));

        if (msg.type !== 'engagement_update') return;

        setScores((prev) => {
          const existing = prev[msg.participant_id];
          // Keep rolling window of last 12 readings for the sparkline
          const history = [
            ...(existing?.history ?? []),
            msg.engagement_score as number,
          ].slice(-12);

          return {
            ...prev,
            [msg.participant_id]: {
              participantId: msg.participant_id,
              engagementScore: msg.engagement_score,
              isDisengaged: msg.is_disengaged,
              label: msg.label,
              ts: msg.ts,
              history,
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
    // Type assertion to handle LiveKit's callback signature
    const boundHandler = handleData as (
      payload: Uint8Array,
      participant?: unknown,
      kind?: DataPacket_Kind,
      topic?: string,
    ) => void;
    room.on(RoomEvent.DataReceived, boundHandler);
    return () => {
      room.off(RoomEvent.DataReceived, boundHandler);
    };
  }, [room, handleData]);

  // ─── Derived state ──────────────────────────────────────────────────────────

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

  // Model status: 'active' once we receive the first engagement update, 'connecting' otherwise
  const modelStatus: 'connecting' | 'active' = sortedScores.length > 0 ? 'active' : 'connecting';

  return {
    scores: sortedScores,
    disengagedCount,
    averageScore,
    totalParticipants: sortedScores.length,
    modelStatus,
  }
}
