import { z } from "zod";
import { AgentToolDefinition } from "../types";
import { getSummary, getStats } from "@/lib/api/task/actions";

export const getProductivitySummaryTool: AgentToolDefinition = {
  name: "get_productivity_summary",
  description:
    "Retrieves the user's general productivity summary, including total tasks, pending tasks, completed tasks, overdue tasks count, tasks due today, and upcoming tasks.",
  parameters: z.object({}),
  execute: async () => {
    const res = await getSummary();
    if (res.error) {
      return { error: res.error };
    }

    const summary = res.data?.summary;
    if (!summary) {
      return { message: "No summary statistics available yet." };
    }

    return {
      total_tasks: Number(summary.total_tasks ?? 0),
      pending_tasks: Number(summary.pending_tasks ?? 0),
      completed_tasks: Number(summary.completed_tasks ?? 0),
      overdue_tasks: Number(summary.overdue_tasks ?? 0),
      due_today_tasks: summary.due_today_tasks || [],
      upcoming_tasks: summary.upcoming_tasks || [],
    };
  },
};

export const getProductivityStatsTool: AgentToolDefinition = {
  name: "get_productivity_stats",
  description:
    "Retrieves detailed productivity metrics and completion rates for the user.",
  parameters: z.object({}),
  execute: async () => {
    const res = await getStats();
    if (res.error) {
      return { error: res.error };
    }

    return {
      stats: res.data || {},
    };
  },
};

export const statsTools: AgentToolDefinition[] = [
  getProductivitySummaryTool,
  getProductivityStatsTool,
];
