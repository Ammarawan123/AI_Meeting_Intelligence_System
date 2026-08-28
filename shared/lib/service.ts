import { api } from "@/shared/lib/api-client";
import type { Meeting, MeetingAiSummary, User } from "@/types";

interface MeetingApiResponse {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: "completed" | "processing" | "failed";
  participants: string[];
  summary: string;
}

interface TranscriptResponse {
  segments: Array<{
    speaker: string;
    start_time: number;
    text: string;
  }>;
}

interface AnalysisApiResponse {
  key_points: Array<{ title: string; content: string; timestamp: string | null }>;
  decisions: Array<{ decision: string; timestamp: string | null }>;
  action_items: Array<{ task: string; owner: string | null; deadline: string | null; timestamp: string | null }>;
  unresolved_issues: string[];
  follow_ups: string[];
  sentiment: MeetingAiSummary["sentiment"];
}

type TranscriptApiSegment = TranscriptResponse["segments"][number];
type KeyPointApiItem = AnalysisApiResponse["key_points"][number];
type DecisionApiItem = AnalysisApiResponse["decisions"][number];
type ActionItemApiItem = AnalysisApiResponse["action_items"][number];

const formatTimestamp = (seconds: number) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
};

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
    const [transcriptResponse, analysisResponse] = await Promise.all([
      api.get<TranscriptResponse>(`/meetings/${id}/transcript`),
      api.get<AnalysisApiResponse>(`/meetings/${id}/analysis`).catch(() => null),
    ]);
    const meeting = toMeeting(response.data);
    meeting.transcript = transcriptResponse.data.segments.map((segment: TranscriptApiSegment, index: number) => ({
      id: `${id}-segment-${index}`,
      speaker: segment.speaker,
      timestamp: formatTimestamp(segment.start_time),
      text: segment.text,
    }));
    meeting.participants = [...new Set(meeting.transcript.map((segment: Meeting["transcript"][number]) => segment.speaker))];

    if (analysisResponse) {
      const analysis = analysisResponse.data;
      meeting.aiInsights = {
        keyPoints: analysis.key_points.map((point: KeyPointApiItem, index: number) => ({
          id: `${id}-point-${index}`,
          title: point.title,
          content: point.content,
        })),
        decisions: analysis.decisions.map((decision: DecisionApiItem, index: number) => ({
          id: `${id}-decision-${index}`,
          summary: decision.decision,
          owner: "Meeting decision",
          status: "approved",
        })),
        actionItems: analysis.action_items.map((item: ActionItemApiItem, index: number) => ({
          id: `${id}-action-${index}`,
          title: item.task,
          assignee: item.owner ?? "Unassigned",
          dueDate: item.deadline ?? "No deadline",
          status: "open",
          priority: "medium",
        })),
        unresolvedIssues: analysis.unresolved_issues,
        followUps: analysis.follow_ups,
        sentiment: analysis.sentiment,
      };
      meeting.decisions = meeting.aiInsights.decisions;
      meeting.actionItems = meeting.aiInsights.actionItems;
    }

    return meeting;
  },

  async askQuestion(id: string, question: string): Promise<{ answer: string; timestamp: string | null }> {
    const response = await api.post<{ answer: string; timestamp: string | null }>(`/meetings/${id}/qa`, { question });
    return response.data;
  },
};

export const authService = {
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },
};
