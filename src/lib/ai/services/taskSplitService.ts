import { v4 as uuidv4 } from "uuid";
import { LexoRank } from "lexorank";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { getAIGateway } from "../gateway/aiGateway";
import {
  TaskSplitInput,
  TaskSplitOutput,
  TaskSplitOutputSchema,
} from "../schemas/taskSplit";
import { wrapUserPromptSafely } from "../promptContext";
import { AI_DEFAULT_CREDIT_COSTS } from "../creditCosts";
import { deductAICredits } from "../credits";
import { TaskType } from "@/lib/schemas/database.types";

const SPLIT_TASK_SYSTEM_PROMPT = `Eres un asistente de productividad personal. Tu misión es analizar una tarea compleja o general y descomponerla en subtareas más pequeñas, concretas y completables.

Reglas estrictas:
- "tasks": un array de entre 2 y el número máximo especificado de subtareas.
- "type": usa "check" para subtareas accionables, o "note" para contexto o recordatorios.
- "text": descripción concisa en español (máx 200 caracteres), directa y sin redundancias.
- "target_date": usa null a menos que haya una referencia temporal muy explícita en la tarea.`;

function generateSplitRanks(
  taskRank: string | null,
  prevTaskRank: string | null,
  count: number
): string[] {
  const ranks: string[] = [];
  let parsedTask: LexoRank | null = null;
  let parsedPrev: LexoRank | null = null;

  try {
    if (taskRank) parsedTask = LexoRank.parse(taskRank);
  } catch { }

  try {
    if (prevTaskRank) parsedPrev = LexoRank.parse(prevTaskRank);
  } catch { }

  if (!parsedTask) {
    let cur = LexoRank.middle();
    for (let i = 0; i < count; i++) {
      cur = cur.genPrev();
      ranks.push(cur.toString());
    }
    return ranks;
  }

  let upper = parsedTask;
  for (let i = 0; i < count; i++) {
    let newRank: LexoRank;
    if (parsedPrev) {
      try {
        newRank = parsedPrev.between(upper);
      } catch {
        newRank = upper.genPrev();
      }
    } else {
      newRank = upper.genPrev();
    }
    ranks.push(newRank.toString());
    upper = newRank;
  }

  return ranks;
}

export class TaskSplitService {
  async execute(
    input: TaskSplitInput,
    user: User,
    supabase: SupabaseClient
  ) {
    const gateway = getAIGateway();
    const systemPrompt = SPLIT_TASK_SYSTEM_PROMPT;
    const userPrompt = wrapUserPromptSafely(
      input.taskContent,
      `Tarea a dividir en máximo ${input.maxSubtasks} subtareas.`
    );

    const gatewayResult = await gateway.generateStructured<TaskSplitOutput>({
      systemPrompt,
      userPrompt,
      schema: TaskSplitOutputSchema,
      schemaName: "TaskSplitResponse",
      temperature: 0.2,
    });

    const deduction = await deductAICredits(
      supabase,
      gatewayResult.usage,
      AI_DEFAULT_CREDIT_COSTS.splitTask
    );

    if (!deduction.allowed) {
      throw new Error(
        deduction.reason === "feature_not_available"
          ? "FEATURE_NOT_AVAILABLE"
          : "AI_LIMIT_EXCEEDED"
      );
    }

    const subtasks = gatewayResult.data.tasks.slice(0, input.maxSubtasks).map((t) => ({
      text: t.text,
      type: t.type,
      target_date: t.target_date ?? null,
    }));

    let persistedTasks: TaskType[] | null = null;
    if (input.saveToDb && input.listId) {
      persistedTasks = await this.confirm(
        subtasks,
        input.listId,
        input.taskRank ?? null,
        input.prevTaskRank ?? null,
        user,
        supabase
      );
    }

    return {
      tasks: subtasks,
      persistedTasks,
      credits: {
        used: deduction.creditCost,
        remaining: deduction.remainingCredits,
      },
      tokenUsage: gatewayResult.usage,
      metadata: gatewayResult.metadata,
    };
  }

  async preview(
    input: TaskSplitInput,
    user: User,
    supabase: SupabaseClient
  ) {
    return this.execute({ ...input, saveToDb: false }, user, supabase);
  }

  async confirm(
    tasks: { text: string; type: "check" | "note"; target_date: string | null }[],
    listId: string,
    taskRank: string | null,
    prevTaskRank: string | null,
    user: User,
    supabase: SupabaseClient
  ): Promise<TaskType[]> {
    const { data: membership, error: membershipError } = await supabase
      .from("list_memberships")
      .select("role")
      .eq("list_id", listId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership || membership.role === "reader") {
      throw new Error("No tienes permisos para crear tareas en esta lista.");
    }

    const ranks = generateSplitRanks(taskRank, prevTaskRank, tasks.length);

    const tasksToInsert = tasks.map((t, i) => ({
      task_id: uuidv4(),
      list_id: listId,
      created_by: user.id,
      task_content: `<p>${t.text}</p>`,
      target_date: t.target_date ?? null,
      completed: t.type === "note" ? null : false,
      rank: ranks[i] ?? null,
      index: 0,
    }));

    const { data: insertedTasks, error: insertError } = await supabase
      .from("tasks")
      .insert(tasksToInsert)
      .select(
        `*,
        created_by:users (
          user_id,
          display_name,
          username,
          avatar_url
        )`
      );

    if (insertError || !insertedTasks) {
      console.error("[TaskSplitService] Insert error:", insertError);
      throw new Error("Error al crear las subtareas en la base de datos.");
    }

    return insertedTasks as TaskType[];
  }
}
