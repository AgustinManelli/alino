import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "../../config";
import {
  AdapterStructuredResponse,
  AdapterTextResponse,
  AIModelAdapter,
  GenerateStructuredOptions,
  GenerateTextOptions,
  TokenUsage,
} from "../types";

export class GeminiAdapter implements AIModelAdapter {
  readonly name = "gemini" as const;
  readonly model: string;
  private apiKey: string;
  private client: GoogleGenAI | null = null;

  constructor() {
    this.model = AI_CONFIG.models.gemini;
    this.apiKey = process.env.GEMINI_API_KEY ?? "";
    if (this.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
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
      throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno.");
    }

    const fullPrompt = `${options.systemPrompt}

REGLA ESTRICTA DE SALIDA:
Debes responder ÚNICAMENTE con un objeto JSON válido que cumpla con la estructura requerida.
No incluyas explicaciones ni bloques de markdown fuera del JSON.

Contenido a procesar:
${options.userPrompt}`;

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: options.temperature ?? 0.2,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Gemini devolvió una respuesta vacía.");
    }

    const meta = response.usageMetadata;
    const usage: TokenUsage = {
      promptTokens: meta?.promptTokenCount ?? 0,
      completionTokens: meta?.candidatesTokenCount ?? 0,
      totalTokens: meta?.totalTokenCount ?? 0,
    };

    try {
      const jsonStr = this.cleanJsonString(text);
      const parsed = JSON.parse(jsonStr);
      return { data: options.schema.parse(parsed), usage };
    } catch (parseError) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { data: options.schema.parse(parsed), usage };
      }
      throw new Error(
        `Gemini no devolvió un JSON compatible con el esquema: ${parseError instanceof Error ? parseError.message : "Error de parseo"}`
      );
    }
  }

  async generateText(options: GenerateTextOptions): Promise<AdapterTextResponse> {
    if (!this.isConfigured() || !this.client) {
      throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno.");
    }

    const fullPrompt = `${options.systemPrompt}\n\nTexto a procesar:\n${options.userPrompt}`;

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: fullPrompt,
      config: {
        temperature: options.temperature ?? 0.3,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Gemini devolvió una respuesta de texto vacía.");
    }

    const meta = response.usageMetadata;
    const usage: TokenUsage = {
      promptTokens: meta?.promptTokenCount ?? 0,
      completionTokens: meta?.candidatesTokenCount ?? 0,
      totalTokens: meta?.totalTokenCount ?? 0,
    };

    return { text, usage };
  }
}
