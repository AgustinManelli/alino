export type AIProviderName = "deepseek" | "gemini" | "openai";

export interface ProviderModelConfig {
  defaultModel: string;
  envKey: string;
}

export const PROVIDER_DEFAULTS: Record<AIProviderName, ProviderModelConfig> = {
  deepseek: {
    defaultModel: "deepseek-chat",
    envKey: "DEEPSEEK_API_KEY",
  },
  gemini: {
    defaultModel: "gemini-2.5-flash",
    envKey: "GEMINI_API_KEY",
  },
  openai: {
    defaultModel: "gpt-4o-mini",
    envKey: "OPENAI_API_KEY",
  },
};

export interface AIConfiguration {
  primaryProvider: AIProviderName;
  fallbackChain: AIProviderName[];
  timeoutMs: number;
  models: Record<AIProviderName, string>;
  model: string;
}

const primary = ((process.env.AI_PROVIDER ||
  process.env.NEXT_PUBLIC_AI_PROVIDER ||
  "deepseek") as AIProviderName).toLowerCase() as AIProviderName;

const models: Record<AIProviderName, string> = {
  deepseek:
    process.env.DEEPSEEK_MODEL ||
    process.env.NEXT_PUBLIC_AI_MODEL ||
    PROVIDER_DEFAULTS.deepseek.defaultModel,
  gemini:
    process.env.GEMINI_MODEL ||
    PROVIDER_DEFAULTS.gemini.defaultModel,
  openai:
    process.env.OPENAI_MODEL ||
    PROVIDER_DEFAULTS.openai.defaultModel,
};

export const AI_CONFIG: AIConfiguration = {
  primaryProvider: primary,
  fallbackChain: ["deepseek", "gemini", "openai"],
  timeoutMs: 40_000,
  models,
  model: models[primary] || PROVIDER_DEFAULTS.deepseek.defaultModel,
};