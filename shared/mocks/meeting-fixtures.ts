export type RawMeetingRecord = {
  meeting_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "completed" | "processing" | "failed";
  summary: string;
  participants: string[];
  recording_url?: string;
  action_items?: Array<{
    id: string;
    title: string;
    assignee: string;
    due_date: string;
    status: "open" | "completed";
    priority: "low" | "medium" | "high";
  }>;
  decisions?: Array<{
    id: string;
    summary: string;
    owner: string;
    status: "approved" | "pending" | "rejected";
  }>;
  transcript?: Array<{
    id: string;
    speaker: string;
    timestamp: string;
    text: string;
  }>;
};

export const rawMeetings: RawMeetingRecord[] = [
  {
    meeting_id: "m-101",
    title: "Q3 Growth Planning",
    scheduled_at: "2026-08-22T09:00:00.000Z",
    duration_minutes: 52,
    status: "completed",
    summary:
      "The team aligned on Q3 growth goals, prioritized pipeline expansion, and agreed to tighten onboarding follow-up cadence.",
    participants: ["Alicia Chen", "Marcus Lee", "Priya Shah", "Nolan Price"],
    recording_url: "/recordings/q3-growth-planning.mp3",
    action_items: [
      {
        id: "a-101",
        title: "Finalize landing page experiment roadmap",
        assignee: "Marcus Lee",
        due_date: "2026-08-28",
        status: "open",
        priority: "high",
      },
      {
        id: "a-102",
        title: "Share onboarding funnel benchmarks",
        assignee: "Priya Shah",
        due_date: "2026-08-30",
        status: "open",
        priority: "medium",
      },
    ],
    decisions: [
      {
        id: "d-101",
        summary: "Increase top-of-funnel spend by 12% after the next campaign review.",
        owner: "Alicia Chen",
        status: "approved",
      },
      {
        id: "d-102",
        summary: "Keep lifecycle outreach in the current 3-step sequence for this quarter.",
        owner: "Nolan Price",
        status: "approved",
      },
    ],
    transcript: [
      {
        id: "t-101",
        speaker: "Alicia Chen",
        timestamp: "00:00",
        text: "Thanks for joining. Let’s align on the Q3 growth plan and decide what deserves immediate investment.",
      },
      {
        id: "t-102",
        speaker: "Marcus Lee",
        timestamp: "00:20",
        text: "The conversion lift looked strongest in the landing page experiments, so I recommend we prioritize that path.",
      },
      {
        id: "t-103",
        speaker: "Priya Shah",
        timestamp: "00:58",
        text: "I’ll pull the onboarding benchmarks and share them before Friday so we can decide on final channel mix.",
      },
    ],
  },
  {
    meeting_id: "m-102",
    title: "Customer Success Handoff",
    scheduled_at: "2026-08-20T14:15:00.000Z",
    duration_minutes: 41,
    status: "processing",
    summary:
      "The post-sale team reviewed handoff gaps and flagged a risk around account health monitoring and escalation windows.",
    participants: ["Jordan Kim", "Lena Ortiz", "Samir Patel", "Dina Ross"],
    recording_url: "/recordings/customer-success-handoff.mp3",
    action_items: [
      {
        id: "a-201",
        title: "Define new onboarding SLA thresholds",
        assignee: "Lena Ortiz",
        due_date: "2026-08-27",
        status: "open",
        priority: "high",
      },
      {
        id: "a-202",
        title: "Review escalation automation backlog",
        assignee: "Samir Patel",
        due_date: "2026-08-29",
        status: "completed",
        priority: "medium",
      },
    ],
    decisions: [
      {
        id: "d-201",
        summary: "Add a health-score trigger for enterprise renewals next sprint.",
        owner: "Jordan Kim",
        status: "pending",
      },
    ],
    transcript: [
      {
        id: "t-201",
        speaker: "Jordan Kim",
        timestamp: "00:00",
        text: "We need a cleaner handoff between sales and customer success to avoid delayed escalations.",
      },
      {
        id: "t-202",
        speaker: "Dina Ross",
        timestamp: "00:45",
        text: "The risk is concentrated in the first 14 days after close, especially around weekly health score reviews.",
      },
    ],
  },
  {
    meeting_id: "m-103",
    title: "Engineering Sync",
    scheduled_at: "2026-08-18T11:00:00.000Z",
    duration_minutes: 63,
    status: "completed",
    summary:
      "The team reviewed sprint performance, unresolved server latency issues, and roadmap tradeoffs for the next release.",
    participants: ["Rina Park", "Omar Ali", "Jules Martin", "Sara Nguyen"],
    action_items: [
      {
        id: "a-301",
        title: "Ship edge-cache fix to reduce latency spikes",
        assignee: "Omar Ali",
        due_date: "2026-08-26",
        status: "open",
        priority: "high",
      },
      {
        id: "a-302",
        title: "Prepare release notes draft",
        assignee: "Sara Nguyen",
        due_date: "2026-08-31",
        status: "open",
        priority: "low",
      },
    ],
    decisions: [
      {
        id: "d-301",
        summary: "Prioritize latency fix over new dashboard widgets in this release.",
        owner: "Rina Park",
        status: "approved",
      },
    ],
    transcript: [
      {
        id: "t-301",
        speaker: "Rina Park",
        timestamp: "00:00",
        text: "The latency issue is trending worse in the east region, so we need to protect the core release path.",
      },
      {
        id: "t-302",
        speaker: "Jules Martin",
        timestamp: "00:30",
        text: "We can ship the cache patch first and leave the widgets as a follow-up item after stabilization.",
      },
    ],
  },
  {
    meeting_id: "m-104",
    title: "Board Readout",
    scheduled_at: "2026-08-15T16:45:00.000Z",
    duration_minutes: 34,
    status: "failed",
    summary:
      "The recording did not process correctly and the transcript quality needs manual review before it can be used in the board pack.",
    participants: ["Emma Flores", "Victor Bell", "Mina Patel"],
    recording_url: "/recordings/board-readout.mp4",
    action_items: [
      {
        id: "a-401",
        title: "Re-upload clean full recording",
        assignee: "Emma Flores",
        due_date: "2026-08-25",
        status: "open",
        priority: "high",
      },
    ],
    decisions: [
      {
        id: "d-401",
        summary: "The materials need a second pass before distribution to the board.",
        owner: "Victor Bell",
        status: "pending",
      },
    ],
    transcript: [
      {
        id: "t-401",
        speaker: "Emma Flores",
        timestamp: "00:00",
        text: "We should manually verify the transcription before we share the board pack.",
      },
    ],
  },
  {
    meeting_id: "m-105",
    title: "Partner Review",
    scheduled_at: "2026-08-11T13:00:00.000Z",
    duration_minutes: 44,
    status: "completed",
    summary:
      "The partner review confirmed the rollout plan and clarified responsibilities between marketing and product for launch support.",
    participants: ["Elena Rivera", "Theo Hall", "Yara Hassan", "Chris Price"],
    action_items: [
      {
        id: "a-501",
        title: "Confirm launch support rotation",
        assignee: "Theo Hall",
        due_date: "2026-08-27",
        status: "completed",
        priority: "medium",
      },
      {
        id: "a-502",
        title: "Prepare partner enablement deck",
        assignee: "Yara Hassan",
        due_date: "2026-08-29",
        status: "open",
        priority: "high",
      },
    ],
    decisions: [
      {
        id: "d-501",
        summary: "Lock in a phased launch with sales enablement on week one.",
        owner: "Elena Rivera",
        status: "approved",
      },
    ],
    transcript: [
      {
        id: "t-501",
        speaker: "Elena Rivera",
        timestamp: "00:00",
        text: "Let’s lock a launch plan that supports the first wave without overloading the field team.",
      },
      {
        id: "t-502",
        speaker: "Chris Price",
        timestamp: "00:36",
        text: "We can support launch readiness by preparing the deck and assigning clear ownership for Q&A.",
      },
    ],
  },
  {
    meeting_id: "m-106",
    title: "Regional Ops Sync",
    scheduled_at: "2026-08-08T10:30:00.000Z",
    duration_minutes: 39,
    status: "processing",
    summary:
      "Operations reviewed local staffing constraints and approved an updated coverage model for the next two months.",
    participants: ["Noah Green", "Iris Chen", "Leo Martins", "Sofia Gomez"],
    action_items: [
      {
        id: "a-601",
        title: "Finalize revised staffing model",
        assignee: "Iris Chen",
        due_date: "2026-08-26",
        status: "open",
        priority: "high",
      },
    ],
    decisions: [
      {
        id: "d-601",
        summary: "Use a hybrid staffing model for the next two months with weekly review checkpoints.",
        owner: "Noah Green",
        status: "pending",
      },
    ],
    transcript: [
      {
        id: "t-601",
        speaker: "Noah Green",
        timestamp: "00:00",
        text: "We will keep the hybrid coverage model in place while we assess staffing in the region.",
      },
    ],
  },
];
