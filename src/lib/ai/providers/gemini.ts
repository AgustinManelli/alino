import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "../config";
import { ACTION_PROMPTS, AIGeneratedTask, AIProvider, EnhanceAction } from "../aiProvider";

const GENERATE_TASKS_SYSTEM_PROMPT = `Eres un asistente de planificación personal. El usuario describirá un objetivo o situación.
Tu tarea es generar tareas concretas, accionables y bien distribuidas en el tiempo.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin texto extra, sin markdown, sin bloques de código):
{
  "tasks": [
    {
      "text": "Texto conciso de la tarea (máx 120 caracteres, en español)",
      "type": "check",
      "target_date": "2024-01-15T10:00:00.000Z"
    }
  ]
}

Reglas:
- type="check" → tareas accionables que se pueden completar
- type="note" → recordatorios o contexto importante
- target_date → distribuye fechas lógicamente desde HOY hasta la fecha límite. Si no hay fecha, usa null.
- Genera entre 1 y el máximo indicado. No generes más del máximo.
- El texto debe ser en español, directo y accionable.`;

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });
  }

  async enhance(text: string, action: EnhanceAction): Promise<string> {
    const systemPrompt = ACTION_PROMPTS[action];
    const prompt = `${systemPrompt}\n\nTexto:\n${text}`;

    const response = await this.client.models.generateContent({
      model: AI_CONFIG.model,
      contents: prompt,
    });

    const result = response.text?.trim();
    if (!result) throw new Error("No se recibió respuesta del modelo.");
    return result;
  }

  async generateTasks(
    prompt: string,
    maxTasks: number,
  ): Promise<AIGeneratedTask[]> {
    const today = new Date().toISOString();

    const fullPrompt = `${GENERATE_TASKS_SYSTEM_PROMPT}\n\nFecha de hoy: ${today}\nMáximo de tareas: ${maxTasks}\n\nObjetivo del usuario:\n${prompt}`;

    const response = await this.client.models.generateContent({
      model: AI_CONFIG.model,
      contents: fullPrompt,
    });

    const raw = response.text?.trim();
    if (!raw) throw new Error("No se recibió respuesta del modelo.");

    // Gemini puede devolver markdown — extraer solo el JSON
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("La IA no devolvió JSON válido.");

    const parsed = JSON.parse(jsonMatch[0]) as { tasks: AIGeneratedTask[] };
    return parsed.tasks.slice(0, maxTasks);
  }
}
