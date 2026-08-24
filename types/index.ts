export type MeetingStatus = "completed" | "processing" | "failed";
export type UploadStatus = "idle" | "uploading" | "processing" | "completed" | "error";
export type Priority = "low" | "medium" | "high";
export type ActionStatus = "open" | "completed";
export type DecisionStatus = "approved" | "pending" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "analyst";
  avatar?: string;
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  timestamp: string;
  text: string;
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: ActionStatus;
  priority: Priority;
}

export interface Decision {
  id: string;
  summary: string;
  owner: string;
  status: DecisionStatus;
}

export interface MeetingInsight {
  id: string;
  title: string;
  content: string;
}

export interface MeetingAiSummary {
  keyPoints: MeetingInsight[];
  decisions: Decision[];
  actionItems: ActionItem[];
  unresolvedIssues: string[];
  followUps: string[];
  sentiment: "positive" | "neutral" | "mixed" | "negative";
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: MeetingStatus;
  participants: string[];
  summary: string;
  recordingUrl?: string;
  actionItems: ActionItem[];
  decisions: Decision[];
  transcript: TranscriptSegment[];
  aiInsights?: MeetingAiSummary;
}

export interface DashboardSummary {
  totalMeetings: number;
  actionItems: number;
  decisions: number;
  deadlines: number;
}

export interface UploadState {
  status: UploadStatus;
  progress: number;
  fileName?: string;
  error?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterInput extends AuthCredentials {
  name: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  meetingId?: string;
}

export interface ChatCommand {
  query: string;
  meetingId: string;
  timestamp: string;
  retryCount?: number;
}

export interface MeetingProcessingState {
  status: "uploaded" | "transcribing" | "analyzing" | "completed";
  updatedAt: string;
}
