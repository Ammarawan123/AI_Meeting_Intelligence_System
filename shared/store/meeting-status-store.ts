import type { MeetingProcessingState } from "@/types";

const store = new Map<string, MeetingProcessingState>();
const listeners = new Set<() => void>();

const defaultState = (): MeetingProcessingState => ({
  status: "uploaded",
  updatedAt: new Date().toISOString(),
});

export const meetingStatusStore = {
  get(meetingId: string) {
    return store.get(meetingId) ?? defaultState();
  },

  set(meetingId: string, nextState: MeetingProcessingState) {
    store.set(meetingId, nextState);
    listeners.forEach((listener) => listener());
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
