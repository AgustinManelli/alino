export type AIProviderName = "openai" | "gemini";

export const AI_CONFIG = {
  /** Proveedor de IA a usar */
  provider: "gemini" as AIProviderName,

  /** Modelo específico del proveedor */
  model: "gemini-2.5-flash",
} as const;
