import OpenAI from "openai";
import { AI_CONFIG } from "../config";
import { ACTION_PROMPTS, AIGeneratedTask, AIProvider, AITaskSplitResponse, EnhanceAction, SPLIT_TASK_SYSTEM_PROMPT } from "../aiProvider";

const GENERATE_TASKS_SYSTEM_PROMPT = `Eres un asistente de planificación personal. El usuario describirá un objetivo o situación.
Tu tarea es generar tareas concretas, accionables y bien distribuidas en el tiempo.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin texto extra, sin markdown):
{
  "listSubject": "Nombre corto y genérico para la lista de tareas (máx 30 caracteres)",
  "tasks": [
    {
      "text": "Texto conciso de la tarea (máx 120 caracteres, en español)",
      "type": "check" | "note",
      "target_date": "2024-01-15T10:00:00.000Z" | null
    }
  ]
}

Reglas estrictas:
- type="check" → tareas accionables que se pueden completar (ej: "Leer capítulo 3 de álgebra")
- type="note" → recordatorios o contexto importante (ej: "Llevar el libro al estudio")
- target_date → distribuye fechas lógicamente desde HOY hasta la fecha límite mencionada. Si no hay fecha clara, usa null.
- Genera entre 1 y el máximo indicado de tareas. No generes más del máximo.
- El texto debe ser en español, directo y accionable.`;

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async enhance(text: string, action: EnhanceAction): Promise<string> {
    const systemPrompt = ACTION_PROMPTS[action];

    const completion = await this.client.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const result = completion.choices[0]?.message?.content?.trim();
    if (!result) throw new Error("No se recibió respuesta del modelo.");
    return result;
  }

  async generateTasks(
    prompt: string,
    maxTasks: number,
  ): Promise<import("../aiProvider").AITaskGenerationResponse> {
    const today = new Date().toISOString();

    const completion = await this.client.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        { role: "system", content: GENERATE_TASKS_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Fecha de hoy: ${today}\nMáximo de tareas: ${maxTasks}\n\nObjetivo del usuario:\n${prompt}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error("No se recibió respuesta del modelo.");

    const parsed = JSON.parse(raw) as import("../aiProvider").AITaskGenerationResponse;
    parsed.tasks = parsed.tasks.slice(0, maxTasks);
    return parsed;
  }

  async splitTask(taskContent: string, maxSubtasks: number): Promise<AITaskSplitResponse> {
    const completion = await this.client.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        { role: "system", content: SPLIT_TASK_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Número máximo de subtareas: ${maxSubtasks}\n\nTarea a dividir:\n${taskContent}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error("No se recibió respuesta del modelo.");

    const parsed = JSON.parse(raw) as AITaskSplitResponse;
    parsed.tasks = (parsed.tasks ?? []).slice(0, maxSubtasks).map(task => ({
      ...task,
      text: (task.text ?? "").slice(0, 200),
      type: task.type === "note" ? "note" : "check",
      target_date: task.target_date ?? null,
    }));
    return parsed;
  }
}
