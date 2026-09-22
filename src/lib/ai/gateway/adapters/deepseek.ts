import { AI_CONFIG } from "../../config";
import {
  AdapterStructuredResponse,
  AdapterTextResponse,
  AIModelAdapter,
  GenerateStructuredOptions,
  GenerateTextOptions,
  TokenUsage,
} from "../types";

export class DeepSeekAdapter implements AIModelAdapter {
  readonly name = "deepseek" as const;
  readonly model: string;
  private apiKey: string;
  private baseUrl = "https://api.deepseek.com/v1";

  constructor() {
    this.model = AI_CONFIG.models.deepseek;
    this.apiKey = process.env.DEEPSEEK_API_KEY ?? "";
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private cleanJsonString(raw: string): string {
    let clean = raw.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```\s*/i, "").replace(/```\s*$/, "");
    }
    return clean.trim();
  }

  async generateStructured<T>(
    options: GenerateStructuredOptions<T>
  ): Promise<AdapterStructuredResponse<T>> {
    if (!this.isConfigured()) {
      throw new Error("DEEPSEEK_API_KEY no está configurada en las variables de entorno.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? AI_CONFIG.timeoutMs
    );

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: `${options.systemPrompt}\n\nREGLA ESTRICTA DE SALIDA: Debes responder ÚNICAMENTE con un JSON válido compatible con el esquema requerido. No uses bloques de markdown con comillas triples ni texto antes o después.`,
            },
            {
              role: "user",
              content: options.userPrompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: options.temperature ?? 0.2,
          max_tokens: 8192,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `DeepSeek API error ${response.status}: ${errorText || response.statusText}`
        );
      }

      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("DeepSeek devolvió una respuesta vacía o inválida.");
      }

      const jsonStr = this.cleanJsonString(content);
      const parsed = JSON.parse(jsonStr);
      const data = options.schema.parse(parsed);

      const usage: TokenUsage = {
        promptTokens: payload?.usage?.prompt_tokens ?? 0,
        completionTokens: payload?.usage?.completion_tokens ?? 0,
        totalTokens: payload?.usage?.total_tokens ?? 0,
      };

      return { data, usage };
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateText(options: GenerateTextOptions): Promise<AdapterTextResponse> {
    if (!this.isConfigured()) {
      throw new Error("DEEPSEEK_API_KEY no está configurada en las variables de entorno.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? AI_CONFIG.timeoutMs
    );

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: options.systemPrompt },
            { role: "user", content: options.userPrompt },
          ],
          temperature: options.temperature ?? 0.3,
          max_tokens: 1500,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `DeepSeek API error ${response.status}: ${errorText || response.statusText}`
        );
      }

      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("DeepSeek devolvió una respuesta de texto vacía.");
      }

      const usage: TokenUsage = {
        promptTokens: payload?.usage?.prompt_tokens ?? 0,
        completionTokens: payload?.usage?.completion_tokens ?? 0,
        totalTokens: payload?.usage?.total_tokens ?? 0,
      };

      return { text: content.trim(), usage };
    } finally {
      clearTimeout(timeout);
    }
  }
}
