import { create } from "zustand";
import { toast } from "sonner";

import { DashboardData } from "@/lib/schemas/todo-schema";

type UserData = {
  summary: DashboardData | null;
  setSummary: (data: DashboardData) => Promise<void>;
};

function handleError(err: unknown) {
  toast.error((err as Error).message || "Error desconocido");
}

export const useSummaryStore = create<UserData>()((set) => ({
  summary: null,
  setSummary: async (data) => {
    set(() => ({ summary: data }));
  },
}));
