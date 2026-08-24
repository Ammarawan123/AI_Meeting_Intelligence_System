"use client";

import { useEffect, useMemo } from "react";
import { useSyncExternalStore } from "react";
import { meetingStatusStore } from "@/shared/store/meeting-status-store";
import type { MeetingProcessingState } from "@/types";

const sequence = ["uploaded", "transcribing", "analyzing", "completed"] as const;

export function useMeetingStatus(meetingId: string) {
  const subscribe = (listener: () => void) => meetingStatusStore.subscribe(listener);
  const getSnapshot = () => meetingStatusStore.get(meetingId);

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot) as MeetingProcessingState;

  useEffect(() => {
    const currentIndex = sequence.indexOf(state.status);

    if (currentIndex >= sequence.length - 1) {
      return;
    }

    // Real polling/WebSocket logic would replace this timer-based simulation.
    const timeout = window.setTimeout(() => {
      const nextStatus = sequence[Math.min(currentIndex + 1, sequence.length - 1)];
      meetingStatusStore.set(meetingId, {
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [meetingId, state.status]);

  return useMemo(
    () => ({
      status: state.status,
      updatedAt: state.updatedAt,
      refresh: () => {
        meetingStatusStore.set(meetingId, {
          status: "uploaded",
          updatedAt: new Date().toISOString(),
        });
      },
    }),
    [meetingId, state.updatedAt, state.status],
  );
}
