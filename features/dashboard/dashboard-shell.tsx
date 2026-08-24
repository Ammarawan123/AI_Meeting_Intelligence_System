"use client";

import { useMemo } from "react";
import { Search, CalendarClock, CircleCheckBig, CircleX, ClipboardList } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { useMeetings } from "@/shared/hooks/useMeetings";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useDashboardStore } from "@/shared/store/dashboard-store";

const statCards = [
  { key: "meetings", label: "Meetings", icon: CalendarClock, accent: "cyan" },
  { key: "actionItems", label: "Action Items", icon: ClipboardList, accent: "amber" },
  { key: "decisions", label: "Decisions", icon: CircleCheckBig, accent: "emerald" },
  { key: "deadlines", label: "Deadlines", icon: CircleX, accent: "rose" },
] as const;

const accentClasses = {
  cyan: "bg-cyan-100 text-cyan-700",
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
} as const;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export function DashboardShell() {
  const { data: meetings = [], isLoading } = useMeetings();
  const { query, setQuery } = useDashboardStore();
  const debouncedQuery = useDebouncedValue(query, 200);

  const filteredMeetings = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) return meetings;
    return meetings.filter((meeting) =>
      [meeting.title, meeting.summary, ...meeting.participants].join(" ").toLowerCase().includes(normalized),
    );
  }, [debouncedQuery, meetings]);

  const stats = useMemo(() => {
    const totalActionItems = meetings.reduce((sum, meeting) => sum + meeting.actionItems.length, 0);
    const totalDecisions = meetings.reduce((sum, meeting) => sum + meeting.decisions.length, 0);
    const deadlines = meetings.filter((meeting) =>
      meeting.actionItems.some((item) => item.status === "open" && new Date(item.dueDate) > new Date()),
    ).length;

    return {
      meetings: meetings.length,
      actionItems: totalActionItems,
      decisions: totalDecisions,
      deadlines,
    };
  }, [meetings]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Meeting overview</h1>
        </div>
        <Button variant="primary">Upload recording</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, accent }) => (
          <Card key={key} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {isLoading ? <Skeleton className="h-8 w-14" /> : stats[key]}
                </p>
              </div>
              <div className={`rounded-xl p-3 ${accentClasses[accent]}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-5 flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-500" />
          <Input
            aria-label="Search meetings"
            placeholder="Search meetings, participants, or topics"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
              No meetings match your search.
            </div>
          ) : (
            filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{meeting.title}</h3>
                    <Badge variant={meeting.status === "completed" ? "success" : meeting.status === "processing" ? "warning" : "danger"}>
                      {meeting.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(meeting.date)} • {meeting.duration}</p>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600">{meeting.summary}</p>
                </div>

                <div className="flex items-center gap-2">
                  {meeting.participants.slice(0, 2).map((participant) => (
                    <span key={participant} className="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-700">
                      {participant}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
