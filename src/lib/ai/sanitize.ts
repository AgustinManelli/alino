export const LIMITS = {
  ENHANCE_TEXT_MAX: 4_000,
  PROMPT_MAX:       1_500,
  TASK_TEXT_MAX:    300,
  LIST_SUBJECT_MAX: 30,
  MAX_TASKS_CAP:    20,
  MIN_TASKS:        1,
} as const;

const CONTROL_CHARS_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function stripControlChars(str: string): string {
  return str.replace(CONTROL_CHARS_RE, "");
}

export function sanitizeText(raw: string, maxLength: number): string {
  if (typeof raw !== "string") return "";
  return stripControlChars(raw).trim().slice(0, maxLength);
}

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(previous|all|prior|above)\s+(instructions?|prompts?|context)/i,
  /forget\s+(everything|all|previous|prior)/i,
  /you\s+are\s+now\s+(a|an|the)\s+/i,
  /new\s+instructions?:/i,
  /system\s*prompt/i,
  /act\s+as\s+(if\s+you\s+are|a|an)/i,
  /\bdan\b/i,
  /\bjailbreak\b/i,
  /override\s+(system|instructions?)/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /print\s+(your\s+)?(system\s+)?prompt/i,
  /disregard\s+(the\s+)?(above|previous)/i,
];

export function containsInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(text));
}

export function clampMaxTasks(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.min(Math.max(Math.floor(n), LIMITS.MIN_TASKS), LIMITS.MAX_TASKS_CAP);
}

import type { AIGeneratedTask } from "./aiProvider";

export function sanitizeGeneratedTask(raw: unknown): AIGeneratedTask | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;

  const text = sanitizeText(String(t.text ?? ""), LIMITS.TASK_TEXT_MAX);
  if (!text) return null;

  const type: AIGeneratedTask["type"] =
    t.type === "note" ? "note" : "check";

  let target_date: string | null = null;
  if (typeof t.target_date === "string" && t.target_date) {
    const d = new Date(t.target_date);
    target_date = isNaN(d.getTime()) ? null : d.toISOString();
  }

  return { text, type, target_date };
}

export function sanitizeTaskResponse(raw: {
  listSubject?: unknown;
  tasks?: unknown[];
}): { listSubject: string; tasks: AIGeneratedTask[] } {
  const listSubject = sanitizeText(
    String(raw.listSubject ?? ""),
    LIMITS.LIST_SUBJECT_MAX
  );
  const tasks = (Array.isArray(raw.tasks) ? raw.tasks : [])
    .map(sanitizeGeneratedTask)
    .filter((t): t is AIGeneratedTask => t !== null)
    .slice(0, LIMITS.MAX_TASKS_CAP);

  return { listSubject: listSubject || "Mis tareas", tasks };
}