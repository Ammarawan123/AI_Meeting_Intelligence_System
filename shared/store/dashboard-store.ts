import { create } from "zustand";

interface DashboardStore {
  query: string;
  setQuery: (query: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  query: "",
  setQuery: (query) => set({ query }),
}));
