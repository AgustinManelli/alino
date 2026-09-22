import { z } from "zod";
import { AIProviderName } from "../config";

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface GenerateStructuredOptions<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T, any, any>;
  schemaName?: string;
  temperature?: number;
  timeoutMs?: number;
}

export interface GenerateTextOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  timeoutMs?: number;
}

export interface ExecutionMetadata {
  providerUsed: AIProviderName;
  modelUsed: string;
  fallbackOccurred: boolean;
  attempts: {
    provider: AIProviderName;
    success: boolean;
    error?: string;
    durationMs: number;
  }[];
  totalDurationMs: number;
}

export interface AdapterStructuredResponse<T> {
  data: T;
  usage?: TokenUsage;
}

export interface AdapterTextResponse {
  text: string;
  usage?: TokenUsage;
}

export interface GatewayResult<T> {
  data: T;
  usage?: TokenUsage;
  metadata: ExecutionMetadata;
}

export interface AIModelAdapter {
  readonly name: AIProviderName;
  readonly model: string;
  isConfigured(): boolean;
  generateStructured<T>(
    options: GenerateStructuredOptions<T>
  ): Promise<AdapterStructuredResponse<T>>;
  generateText(options: GenerateTextOptions): Promise<AdapterTextResponse>;
}
