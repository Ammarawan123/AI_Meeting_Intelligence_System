"use client";

import { useQuery } from "@tanstack/react-query";
import { meetingService } from "@/shared/lib/service";

export function useMeetings() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: () => meetingService.getMeetings(),
  });
}
