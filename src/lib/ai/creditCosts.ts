import type { TokenUsage } from "./gateway/types";

export const AI_FEATURE_KEY = "ai_credits" as const;

export const TOKENS_PER_CREDIT = 400;

export const AI_DEFAULT_CREDIT_COSTS = {
  enhance: 1,
  generateTasks: 3,
  splitTask: 3,
} as const;

export const AI_CREDIT_COSTS = AI_DEFAULT_CREDIT_COSTS;

export type AIOperation = keyof typeof AI_DEFAULT_CREDIT_COSTS;

export function calculateDynamicCredits(
  usage?: TokenUsage,
  fallbackCost: number = 1
): number {
  if (!usage || !usage.totalTokens || usage.totalTokens <= 0) {
    return fallbackCost;
  }

  const weightedTokens = usage.promptTokens + usage.completionTokens * 1.3;
  const calculated = Math.ceil(weightedTokens / TOKENS_PER_CREDIT);
  return Math.max(1, calculated);
}