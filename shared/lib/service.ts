import { mockAdapter } from "@/shared/lib/mock-adapter";
import type { Meeting, User } from "@/types";

export const meetingService = {
  async getMeetings(): Promise<Meeting[]> {
    return mockAdapter.getMeetings();
  },

  async getMeetingFull(id: string): Promise<Meeting> {
    return mockAdapter.getMeetingById(id);
  },
};

export const authService = {
  async getCurrentUser(): Promise<User> {
    return mockAdapter.getUser();
  },
};
