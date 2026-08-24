"use client";

import { useQuery } from "@tanstack/react-query";
import { meetingService } from "@/shared/lib/service";

export function useMeeting(id: string) {
  return useQuery({
    queryKey: ["meeting", id],
    queryFn: () => meetingService.getMeetingFull(id),
    enabled: Boolean(id),
  });
}
