"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquareText, Mic, Search, Sparkles, Users, FileText, BrainCircuit } from "lucide-react";
import { useMeeting } from "@/shared/hooks/useMeeting";
import { meetingService } from "@/shared/lib/service";
import { useMeetingStatus } from "@/shared/hooks/useMeetingStatus";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { PanelErrorBoundary } from "@/features/meeting-details/error-boundary";
import { usePlayer } from "@/context/player-context";

const tabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "transcript", label: "Transcript", icon: Mic },
  { id: "insights", label: "AI Insights", icon: BrainCircuit },
  { id: "chat", label: "Ask AI", icon: MessageSquareText },
] as const;

const parseTimestamp = (value: string) => {
  const [minutes, seconds] = value.split(":").map(Number);
  return minutes * 60 + seconds;
};

const formatTimestamp = (value: string) => {
  const totalSeconds = parseTimestamp(value);
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

type ChatEntry = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
};

function MeetingDetailsContent({ id }: { id: string }) {
  const { data: meeting, isLoading, error } = useMeeting(id);
  const meetingStatus = useMeetingStatus(id);
  const { seekTo } = usePlayer();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");
  const [query, setQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatEntry[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "I can summarize this meeting, explain unclear decisions, or jump to the relevant transcript moments.",
      timestamp: "00:00",
    },
  ]);

  const transcriptMatches = useMemo(() => {
    if (!meeting) return [] as string[];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [] as string[];
    return meeting.transcript.filter((segment) => segment.text.toLowerCase().includes(normalized)).map((segment) => segment.id);
  }, [meeting, query]);

  const transcriptSummary = query.trim()
    ? `${transcriptMatches.length} match${transcriptMatches.length === 1 ? "" : "es"}`
    : "Entire transcript";

  const handleTimestampJump = (timestamp: string) => {
    const timeInSeconds = parseTimestamp(timestamp);
    seekTo(timeInSeconds);
    setActiveTab("transcript");
  };

  const handleChatSubmit = async () => {
    if (!meeting || !chatInput.trim()) return;

    const userMessage: ChatEntry = {
      id: `chat-${Date.now()}`,
      role: "user",
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const lowerQuestion = userMessage.text.toLowerCase();
    let answer = "I found the relevant discussion in the meeting. We can review the transcript and action items for the next step.";
    let apiAnswer = false;
    let answerTimestamp = meeting.transcript[0]?.timestamp ?? "00:00";

    try {
      const response = await meetingService.askQuestion(id, userMessage.text);
      answer = response.answer;
      apiAnswer = true;
      answerTimestamp = response.timestamp ?? answerTimestamp;
    } catch {
      apiAnswer = false;
    }

    if (!apiAnswer && (lowerQuestion.includes("decision") || lowerQuestion.includes("decide"))) {
      answer = `The main decision was: ${meeting.decisions[0]?.summary ?? "No explicit decision captured in this session."}`;
    }

    if (!apiAnswer && (lowerQuestion.includes("action") || lowerQuestion.includes("owner") || lowerQuestion.includes("deadline"))) {
      const nextTask = meeting.actionItems[0];
      answer = `${nextTask?.title ?? "No assigned items"} is owned by ${nextTask?.assignee ?? "the team"} and is due ${nextTask?.dueDate ?? "TBD"}.`;
    }

    if (!apiAnswer && (lowerQuestion.includes("risk") || lowerQuestion.includes("issue") || lowerQuestion.includes("problem"))) {
      answer = meeting.aiInsights?.unresolvedIssues?.[0] ?? "The key unresolved risk is retaining consistent onboarding follow-through across the next review cycle.";
    }

    const assistantMessage: ChatEntry = {
      id: `reply-${Date.now()}`,
      role: "assistant",
      text: answer,
      timestamp: answerTimestamp,
    };

    setChatMessages((prev) => [...prev, userMessage, assistantMessage]);
    setChatInput("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-40 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-52 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!meeting || error) {
    return (
      <Card className="p-6">
        <p className="text-rose-600">This meeting could not be loaded.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-500">Meeting</p>
            <h1 className="text-3xl font-semibold text-slate-900">{meeting.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={meetingStatus.status === "completed" ? "success" : meetingStatus.status === "transcribing" || meetingStatus.status === "analyzing" ? "warning" : "neutral"}>{meetingStatus.status}</Badge>
          <Badge variant="neutral">{new Date(meetingStatus.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Badge>
        </div>
      </div>

      <Card className="p-4">
        <audio
          controls
          className="w-full"
          src={meeting.recordingUrl ?? "/sample-meeting.mp3"}
          onTimeUpdate={(event) => {
            const audio = event.currentTarget;
            if (Number.isFinite(audio.currentTime)) {
              const seconds = audio.currentTime;
              const nextMinute = Math.floor(seconds / 60)
                .toString()
                .padStart(2, "0");
              const nextSecond = Math.floor(seconds % 60)
                .toString()
                .padStart(2, "0");
              const nextStamp = `${nextMinute}:${nextSecond}`;
              const target = meeting.transcript.find((segment) => segment.timestamp === nextStamp);
              if (target) {
                document.getElementById(target.id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }
            }
          }}
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Date", value: new Date(meeting.date).toLocaleDateString() },
          { label: "Duration", value: meeting.duration },
          { label: "Participants", value: String(meeting.participants.length) },
          { label: "Status", value: meetingStatus.status },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="border-b border-slate-200">
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{meeting.summary}</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-600" />
              <h3 className="text-lg font-semibold text-slate-900">Participants</h3>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {meeting.participants.map((participant) => (
                <span key={participant} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  {participant}
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "transcript" && (
        <PanelErrorBoundary title="Transcript">
          <Card className="p-4">
            <div className="mb-4 flex items-center gap-3">
              <Search className="h-4 w-4 text-slate-500" />
              <Input
                aria-label="Search transcript"
                placeholder="Search transcript"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="mb-3 text-xs uppercase tracking-[0.15em] text-slate-500">{transcriptSummary}</div>
            <div className="h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50">
              {meeting.transcript.map((segment) => {
                const highlighted = query.trim() && segment.text.toLowerCase().includes(query.trim().toLowerCase());
                return (
                  <div id={segment.id} key={segment.id} className="border-b border-slate-100 px-3 py-3">
                    <button type="button" onClick={() => handleTimestampJump(segment.timestamp)} className="mb-1 flex w-full items-center justify-between text-left">
                      <span className="text-xs font-medium text-cyan-700">{segment.speaker}</span>
                      <span className="text-xs text-slate-500">{formatTimestamp(segment.timestamp)}</span>
                    </button>
                    <p className="text-sm text-slate-700">
                      {highlighted ? (
                        <>
                          {segment.text.split(new RegExp(`(${query.trim()})`, "ig")).map((chunk, idx) =>
                            chunk.toLowerCase() === query.trim().toLowerCase() ? <mark key={`${chunk}-${idx}`} className="rounded bg-yellow-200 px-1">{chunk}</mark> : chunk,
                          )}
                        </>
                      ) : (
                        segment.text
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </PanelErrorBoundary>
      )}

      {activeTab === "insights" && (
        <PanelErrorBoundary title="AI Insights">
          <div className="grid gap-6">
            <Card className="p-5">
              <h3 className="text-lg font-semibold text-slate-900">AI Highlights</h3>
              <div className="mt-4 space-y-3">
                {(meeting.aiInsights?.keyPoints ?? []).map((point) => (
                  <div key={point.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="font-medium text-slate-800">{point.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{point.content}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-5">
                <h3 className="text-lg font-semibold text-slate-900">Decisions</h3>
                <div className="mt-4 space-y-3">
                  {(meeting.aiInsights?.decisions ?? meeting.decisions).map((decision) => (
                    <div key={decision.id} className="rounded-xl border border-slate-200 p-3">
                      <p className="text-sm text-slate-700">{decision.summary}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.15em] text-slate-500">{decision.owner}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-lg font-semibold text-slate-900">Action items</h3>
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="p-3">Task</th>
                        <th className="p-3">Owner</th>
                        <th className="p-3">Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(meeting.aiInsights?.actionItems ?? meeting.actionItems).map((item) => (
                        <tr key={item.id} className="border-t border-slate-200">
                          <td className="p-3 text-slate-700">{item.title}</td>
                          <td className="p-3 text-slate-600">{item.assignee}</td>
                          <td className="p-3 text-slate-600">{item.dueDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-5">
                <h3 className="text-lg font-semibold text-slate-900">Unresolved issues</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {(meeting.aiInsights?.unresolvedIssues ?? ["No unresolved issues identified"]).map((issue) => (
                    <li key={issue} className="rounded-lg bg-rose-50 px-3 py-2 text-rose-700">{issue}</li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5">
                <h3 className="text-lg font-semibold text-slate-900">Follow-ups</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {(meeting.aiInsights?.followUps ?? ["Follow-up sync scheduled for next week"]).map((item) => (
                    <li key={item} className="rounded-lg bg-cyan-50 px-3 py-2 text-cyan-700">{item}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </PanelErrorBoundary>
      )}

      {activeTab === "chat" && (
        <PanelErrorBoundary title="Ask AI">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-500">Meeting Q&A</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">Ask AI</h3>
              </div>
              <Sparkles className="h-5 w-5 text-cyan-600" />
            </div>

            <div className="space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
                    <p className="text-sm">{message.text}</p>
                    {message.role === "assistant" && (
                      <button type="button" onClick={() => handleTimestampJump(message.timestamp)} className="mt-3 text-xs font-medium text-cyan-700 underline">
                        Jump to timestamp
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <Input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask about decisions, action items, or risks"
              />
              <Button type="button" onClick={handleChatSubmit}>Send</Button>
            </div>
          </Card>
        </PanelErrorBoundary>
      )}
    </div>
  );
}

export function MeetingDetailsPage({ id }: { id: string }) {
  return <MeetingDetailsContent id={id} />;
}
