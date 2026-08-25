import { api } from "@/shared/lib/api-client";
import type { Meeting, User } from "@/types";

interface MeetingApiResponse {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: "completed" | "processing" | "failed";
  participants: string[];
  summary: string;
}

const toMeeting = (record: MeetingApiResponse): Meeting => ({
  id: record.id,
  title: record.title,
  date: record.date,
  duration: record.duration,
  status: record.status,
  participants: record.participants,
  summary: record.summary,
  actionItems: [],
  decisions: [],
  transcript: [],
});

export const meetingService = {
  async getMeetings(): Promise<Meeting[]> {
    const response = await api.get<MeetingApiResponse[]>("/meetings");
    return response.data.map(toMeeting);
  },

  async getMeetingFull(id: string): Promise<Meeting> {
    const response = await api.get<MeetingApiResponse>(`/meetings/${id}`);
    return toMeeting(response.data);
  },
};

export const authService = {
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },
};
