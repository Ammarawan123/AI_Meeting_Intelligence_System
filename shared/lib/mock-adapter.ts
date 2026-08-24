import { rawMeetings, type RawMeetingRecord } from "@/shared/mocks/meeting-fixtures";
import type { Meeting, User } from "@/types";

const mockUser: User = {
  id: "u-1",
  name: "Avery Morgan",
  email: "demo@meetingintel.ai",
  role: "admin",
  avatar: "AM",
};

let forceError = false;

const randomDelay = (min = 400, max = 800) =>
  new Promise((resolve) => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(resolve, delay);
  });

const adaptMeeting = (record: RawMeetingRecord): Meeting => ({
  id: record.meeting_id,
  title: record.title,
  date: record.scheduled_at,
  duration: `${record.duration_minutes} min`,
  status: record.status,
  participants: record.participants ?? [],
  summary: record.summary,
  recordingUrl: record.recording_url,
  actionItems: (record.action_items ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    assignee: item.assignee,
    dueDate: item.due_date,
    status: item.status,
    priority: item.priority,
  })),
  decisions: (record.decisions ?? []).map((decision) => ({
    id: decision.id,
    summary: decision.summary,
    owner: decision.owner,
    status: decision.status,
  })),
  transcript: (record.transcript ?? []).map((segment) => ({
    id: segment.id,
    speaker: segment.speaker,
    timestamp: segment.timestamp,
    text: segment.text,
  })),
});

export const mockAdapter = {
  setForceError(nextValue: boolean) {
    forceError = nextValue;
  },

  async getUser(): Promise<User> {
    await randomDelay();
    if (forceError) {
      throw new Error("Simulated user load failure.");
    }
    return mockUser;
  },

  async getMeetings(): Promise<Meeting[]> {
    await randomDelay();
    if (forceError) {
      throw new Error("Simulated network error while fetching meetings.");
    }
    return rawMeetings.map(adaptMeeting);
  },

  async getMeetingById(id: string): Promise<Meeting> {
    await randomDelay();
    if (forceError) {
      throw new Error("Simulated backend failure on meeting load.");
    }

    const meeting = rawMeetings.find((entry) => entry.meeting_id === id);

    if (!meeting) {
      throw new Error(`Meeting ${id} not found`);
    }

    return adaptMeeting(meeting);
  },

  async uploadRecording(file: File): Promise<{ success: boolean; fileName: string; message: string }> {
    await randomDelay(500, 900);
    if (forceError) {
      throw new Error("Simulated upload failure. Please retry.");
    }

    return {
      success: true,
      fileName: file.name,
      message: "Recording uploaded and queued for AI processing.",
    };
  },
};
