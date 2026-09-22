import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/ai/aiMiddleware";
import { TaskSplitService } from "@/lib/ai/services/taskSplitService";

export const maxDuration = 30;

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

  const validTasks = rawTasks
    .map((t: any) => ({
      text: String(t.text || "").trim(),
      type: (t.type === "note" ? "note" : "check") as "note" | "check",
      target_date: typeof t.target_date === "string" ? t.target_date : null,
    }))
    .filter((t) => t.text.length > 0);

  if (validTasks.length === 0) {
    return NextResponse.json({ error: "No hay subtareas válidas." }, { status: 422 });
  }

  try {
    const service = new TaskSplitService();
    const insertedTasks = await service.confirm(
      validTasks,
      listId,
      typeof taskRank === "string" ? taskRank : null,
      typeof prevTaskRank === "string" ? prevTaskRank : null,
      user,
      supabase
    );

    return NextResponse.json({ tasks: insertedTasks });
  } catch (err: unknown) {
    console.error("[split/confirm] Error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Error al crear las subtareas. Intentá nuevamente.",
      },
      { status: 500 }
    );
  }
}
