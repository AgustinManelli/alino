import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { LexoRank } from "lexorank";
import { getAuthenticatedUser } from "@/lib/ai/aiMiddleware";
import { sanitizeText, LIMITS } from "@/lib/ai/sanitize";
import type { AIGeneratedTask } from "@/lib/ai/aiProvider";

function tryParseRank(rank: string): LexoRank | null {
  try {
    return LexoRank.parse(rank);
  } catch {
    return null;
  }
}

function generateSplitRanks(
  taskRank: string | null,
  prevTaskRank: string | null,
  count: number
): string[] {
  const ranks: string[] = [];

  const parsedTask = taskRank ? tryParseRank(taskRank) : null;
  const parsedPrev = prevTaskRank ? tryParseRank(prevTaskRank) : null;

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

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, supabase } = auth;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const { tasks: rawTasks, listId, taskRank, prevTaskRank } = body;

  if (!listId || typeof listId !== "string") {
    return NextResponse.json({ error: "listId es requerido." }, { status: 400 });
  }

  if (!Array.isArray(rawTasks) || rawTasks.length === 0) {
    return NextResponse.json({ error: "No hay subtareas para crear." }, { status: 400 });
  }

  const validTasks: AIGeneratedTask[] = rawTasks
    .map((t: unknown) => {
      if (!t || typeof t !== "object") return null;
      const task = t as Record<string, unknown>;
      const text = sanitizeText(String(task.text ?? ""), LIMITS.TASK_TEXT_MAX);
      if (!text) return null;
      return {
        text,
        type: (task.type === "note" ? "note" : "check") as "note" | "check",
        target_date:
          typeof task.target_date === "string" ? task.target_date : null,
      };
    })
    .filter((t): t is AIGeneratedTask => t !== null);

  if (validTasks.length === 0) {
    return NextResponse.json({ error: "No hay subtareas válidas." }, { status: 422 });
  }

  const { data: membership, error: membershipError } = await supabase
    .from("list_memberships")
    .select("role")
    .eq("list_id", listId)
    .eq("user_id", user.id)
    .single();

  if (membershipError || !membership || membership.role === "reader") {
    return NextResponse.json(
      { error: "No tienes permisos para crear tareas en esta lista." },
      { status: 403 }
    );
  }

  const ranks = generateSplitRanks(
    typeof taskRank === "string" ? taskRank : null,
    typeof prevTaskRank === "string" ? prevTaskRank : null,
    validTasks.length
  );

  const tasksToInsert = validTasks.map((t, i) => ({
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
    console.error("[split/confirm] Insert error:", insertError);
    return NextResponse.json(
      { error: "Error al crear las subtareas. Intentá nuevamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ tasks: insertedTasks });
}
