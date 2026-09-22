import { AgentToolDefinition } from "../types";
import { tasksTools } from "./tasks.tools";
import { listsTools } from "./lists.tools";
import { foldersTools } from "./folders.tools";
import { statsTools } from "./stats.tools";
import { gamificationTools } from "./gamification.tools";
import { createWorkspaceHierarchyTool } from "./workspaceHierarchy.tools";

export const ALL_AGENT_TOOLS: AgentToolDefinition[] = [
  createWorkspaceHierarchyTool,
  ...tasksTools,
  ...listsTools,
  ...foldersTools,
  ...statsTools,
  ...gamificationTools,
];

export const AGENT_TOOLS_MAP = new Map<string, AgentToolDefinition>(
  ALL_AGENT_TOOLS.map((t) => [t.name, t])
);

export function getToolByName(name: string): AgentToolDefinition | undefined {
  return AGENT_TOOLS_MAP.get(name);
}
