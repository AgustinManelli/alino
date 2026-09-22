import { AI_CONFIG, AIProviderName } from "../config";
import { DeepSeekAdapter } from "./adapters/deepseek";
import { GeminiAdapter } from "./adapters/gemini";
import { OpenAIAdapter } from "./adapters/openai";
import {
  AIModelAdapter,
  GatewayResult,
  GenerateStructuredOptions,
  GenerateTextOptions,
} from "./types";

export class AIGateway {
  private adapters: Map<AIProviderName, AIModelAdapter> = new Map();

  constructor() {
    this.adapters.set("deepseek", new DeepSeekAdapter());
    this.adapters.set("gemini", new GeminiAdapter());
    this.adapters.set("openai", new OpenAIAdapter());
  }

  private getCandidateProviders(): AIModelAdapter[] {
    const primary = AI_CONFIG.primaryProvider;
    const fallbackList = AI_CONFIG.fallbackChain;

    const orderedNames: AIProviderName[] = [
      primary,
      ...fallbackList.filter((name) => name !== primary),
    ];

    const available: AIModelAdapter[] = [];
    for (const name of orderedNames) {
      const adapter = this.adapters.get(name);
      if (adapter && adapter.isConfigured()) {
        available.push(adapter);
      }
    }

    if (available.length === 0) {
      throw new Error(
        "AI_CONFIG_ERROR: No hay ningún proveedor de IA configurado con una clave API válida (DEEPSEEK_API_KEY, GEMINI_API_KEY u OPENAI_API_KEY)."
      );
    }

    return available;
  }

  async generateStructured<T>(
    options: GenerateStructuredOptions<T>
  ): Promise<GatewayResult<T>> {
    const candidates = this.getCandidateProviders();
    const startTime = Date.now();
    const attempts: {
      provider: AIProviderName;
      success: boolean;
      error?: string;
      durationMs: number;
    }[] = [];

    let lastError: Error | null = null;

    for (let i = 0; i < candidates.length; i++) {
      const adapter = candidates[i];
      const attemptStart = Date.now();

      try {
        const response = await adapter.generateStructured(options);
        const durationMs = Date.now() - attemptStart;

        attempts.push({
          provider: adapter.name,
          success: true,
          durationMs,
        });

        const fallbackOccurred = i > 0;
        if (fallbackOccurred) {
          console.warn(
            `[AIGateway] Fallback exitoso con "${adapter.name}". El proveedor primario falló previamente.`
          );
        }

        return {
          data: response.data,
          usage: response.usage,
          metadata: {
            providerUsed: adapter.name,
            modelUsed: adapter.model,
            fallbackOccurred,
            attempts,
            totalDurationMs: Date.now() - startTime,
          },
        };
      } catch (err: unknown) {
        const durationMs = Date.now() - attemptStart;
        const errMsg = err instanceof Error ? err.message : String(err);
        lastError = err instanceof Error ? err : new Error(errMsg);

        console.error(
          `[AIGateway] Proveedor "${adapter.name}" falló (${durationMs}ms): ${errMsg}`
        );

        attempts.push({
          provider: adapter.name,
          success: false,
          error: errMsg,
          durationMs,
        });
      }
    }

    throw new Error(
      `AI_DISPATCH_FAILURE: Todos los proveedores de IA configurados fallaron. Último error: ${lastError?.message || "Desconocido"}`
    );
  }

  async generateText(options: GenerateTextOptions): Promise<GatewayResult<string>> {
    const candidates = this.getCandidateProviders();
    const startTime = Date.now();
    const attempts: {
      provider: AIProviderName;
      success: boolean;
      error?: string;
      durationMs: number;
    }[] = [];

    let lastError: Error | null = null;

    for (let i = 0; i < candidates.length; i++) {
      const adapter = candidates[i];
      const attemptStart = Date.now();

      try {
        const response = await adapter.generateText(options);
        const durationMs = Date.now() - attemptStart;

        attempts.push({
          provider: adapter.name,
          success: true,
          durationMs,
        });

        const fallbackOccurred = i > 0;
        if (fallbackOccurred) {
          console.warn(
            `[AIGateway] Fallback exitoso con "${adapter.name}".`
          );
        }

        return {
          data: response.text,
          usage: response.usage,
          metadata: {
            providerUsed: adapter.name,
            modelUsed: adapter.model,
            fallbackOccurred,
            attempts,
            totalDurationMs: Date.now() - startTime,
          },
        };
      } catch (err: unknown) {
        const durationMs = Date.now() - attemptStart;
        const errMsg = err instanceof Error ? err.message : String(err);
        lastError = err instanceof Error ? err : new Error(errMsg);

        console.error(
          `[AIGateway] Proveedor "${adapter.name}" falló (${durationMs}ms): ${errMsg}`
        );

        attempts.push({
          provider: adapter.name,
          success: false,
          error: errMsg,
          durationMs,
        });
      }
    }

    throw new Error(
      `AI_DISPATCH_FAILURE: Todos los proveedores de IA configurados fallaron. Último error: ${lastError?.message || "Desconocido"}`
    );
  }
}

let gatewayInstance: AIGateway | null = null;

export function getAIGateway(): AIGateway {
  if (!gatewayInstance) {
    gatewayInstance = new AIGateway();
  }
  return gatewayInstance;
}
