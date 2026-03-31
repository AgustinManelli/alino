export type AIProviderName = "openai" | "gemini" | "deepseek";

interface ProviderConfig {
  provider: AIProviderName;
  model: string;
}

export const AI_CONFIG: ProviderConfig = {
  provider: (process.env.NEXT_PUBLIC_AI_PROVIDER as AIProviderName) ?? "gemini",
  model: process.env.NEXT_PUBLIC_AI_MODEL ?? "gemini-2.5-flash",
};