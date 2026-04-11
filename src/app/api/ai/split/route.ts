import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, handleAIError, handleCreditResult } from "@/lib/ai/aiMiddleware";
import { getAIProvider } from "@/lib/ai/getProvider";
import { containsInjection, sanitizeText, clampMaxTasks, LIMITS } from "@/lib/ai/sanitize";
import { AI_FEATURE_KEY, AI_CREDIT_COSTS } from "@/lib/ai/creditCosts";

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

  const rawContent = body.taskContent;
  if (!rawContent || typeof rawContent !== "string") {
    return NextResponse.json({ error: "taskContent es requerido." }, { status: 400 });
  }

  const plainText = rawContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const taskContent = sanitizeText(plainText, LIMITS.PROMPT_MAX);

  if (!taskContent) {
    return NextResponse.json({ error: "El contenido de la tarea está vacío." }, { status: 400 });
  }

  if (containsInjection(taskContent)) {
    return NextResponse.json(
      { error: "El contenido de la tarea contiene texto no permitido." },
      { status: 422 }
    );
  }

  const maxSubtasks = clampMaxTasks(body.maxSubtasks) ?? 5;

  const { data: creditResult, error: creditError } = await supabase.rpc(
    "consume_feature_limit",
    {
      p_feature_key: AI_FEATURE_KEY,
      p_cost: AI_CREDIT_COSTS.splitTask,
    }
  );

  if (creditError) {
    console.error("[split] Credit RPC error:", creditError);
    return NextResponse.json({ error: "Error al procesar créditos." }, { status: 500 });
  }

  const creditErrorResponse = handleCreditResult(creditResult);
  if (creditErrorResponse) return creditErrorResponse;

  try {
    const provider = getAIProvider();
    const result = await provider.splitTask(taskContent, maxSubtasks);

    if (!result || !result.tasks || result.tasks.length === 0) {
      return NextResponse.json(
        { error: "La IA no pudo generar subtareas para esta tarea." },
        { status: 422 }
      );
    }

    const sanitized = result.tasks
      .map((t) => ({
        text: sanitizeText(t.text ?? "", LIMITS.TASK_TEXT_MAX),
        type: t.type === "note" ? "note" : "check",
        target_date: t.target_date ?? null,
      }))
      .filter((t) => t.text.length > 0)
      .slice(0, maxSubtasks);

    return NextResponse.json({
      tasks: sanitized,
      credits: {
        used: creditResult.used,
        limit: creditResult.limit,
        remaining: creditResult.remaining,
      },
    });
  } catch (err) {
    return handleAIError(err);
  }
}
