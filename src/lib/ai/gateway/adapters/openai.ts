import OpenAI from "openai";
import { AI_CONFIG } from "../../config";
import {
  AdapterStructuredResponse,
  AdapterTextResponse,
  AIModelAdapter,
  GenerateStructuredOptions,
  GenerateTextOptions,
  TokenUsage,
} from "../types";

export class OpenAIAdapter implements AIModelAdapter {
  readonly name = "openai" as const;
  readonly model: string;
  private apiKey: string;
  private client: OpenAI | null = null;

  constructor() {
    this.model = AI_CONFIG.models.openai;
    this.apiKey = process.env.OPENAI_API_KEY ?? "";
    if (this.apiKey) {
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && this.client);
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
    if (!this.isConfigured() || !this.client) {
      throw new Error("OPENAI_API_KEY no está configurada en las variables de entorno.");
    }

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: `${options.systemPrompt}\n\nResponde ÚNICAMENTE con un JSON válido compatible con el esquema requerido.`,
        },
        { role: "user", content: options.userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: options.temperature ?? 0.2,
      max_tokens: 8192,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI devolvió una respuesta vacía.");
    }

    const clean = this.cleanJsonString(content);
    const parsed = JSON.parse(clean);
    const data = options.schema.parse(parsed);

    const usage: TokenUsage = {
      promptTokens: completion.usage?.prompt_tokens ?? 0,
      completionTokens: completion.usage?.completion_tokens ?? 0,
      totalTokens: completion.usage?.total_tokens ?? 0,
    };

    return { data, usage };
  }

  async generateText(options: GenerateTextOptions): Promise<AdapterTextResponse> {
    if (!this.isConfigured() || !this.client) {
      throw new Error("OPENAI_API_KEY no está configurada en las variables de entorno.");
    }

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI devolvió una respuesta de texto vacía.");
    }

    const usage: TokenUsage = {
      promptTokens: completion.usage?.prompt_tokens ?? 0,
      completionTokens: completion.usage?.completion_tokens ?? 0,
      totalTokens: completion.usage?.total_tokens ?? 0,
    };

    return { text: content.trim(), usage };
  }
}
