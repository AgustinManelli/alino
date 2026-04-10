import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/getProvider";
import { createClient as createClientServer } from "@/utils/supabase/server";
import {
  sanitizeText,
  containsInjection,
  clampMaxTasks,
  sanitizeTaskResponse,
  LIMITS,
} from "@/lib/ai/sanitize";
import { AI_FEATURE_KEY, AI_CREDIT_COSTS } from "@/lib/ai/creditCosts";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = createClientServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado. Iniciá sesión para continuar." },
        { status: 401 },
      );
    }

    const { data: tier, error: tierError } = await supabase.rpc(
      "get_user_tier",
      { p_user_id: user.id },
    );

    if (tierError) {
      console.error("[AI Tasks] Error obteniendo tier:", tierError);
      return NextResponse.json(
        { error: "Error al verificar la suscripción." },
        { status: 500 },
      );
    }

    const currentTier = tier || "free";
    const hasAccess = currentTier === "pro" || currentTier === "student" || currentTier === "ultra";

    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Acceso denegado. Esta función requiere un plan Pro o Estudiante.",
          code: "TIER_INSUFFICIENT",
        },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Cuerpo de la solicitud inválido." },
        { status: 400 },
      );
    }

    const rawPrompt = body.prompt;
    if (!rawPrompt || typeof rawPrompt !== "string") {
      return NextResponse.json(
        { error: "El prompt no puede estar vacío." },
        { status: 400 },
      );
    }

    const prompt = sanitizeText(rawPrompt, LIMITS.PROMPT_MAX);
    if (!prompt) {
      return NextResponse.json(
        { error: "El prompt no puede estar vacío." },
        { status: 400 },
      );
    }

    if (containsInjection(prompt)) {
      return NextResponse.json(
        { error: "El prompt contiene contenido no permitido." },
        { status: 422 },
      );
    }

    const cost = AI_CREDIT_COSTS.generateTasks;
    const { data: creditResult, error: creditError } = await supabase.rpc(
      "consume_feature_limit",
      {
        p_feature_key: AI_FEATURE_KEY,
        p_cost: cost,
      },
    );

    if (creditError) {
      console.error("[AI Tasks] Error consumiendo créditos:", creditError);
      return NextResponse.json(
        { error: "Error al verificar los créditos de IA." },
        { status: 500 },
      );
    }

    if (!creditResult?.allowed) {
      return NextResponse.json(
        {
          error:
            "Alcanzaste tu límite de créditos IA para este período. Podés ver tu uso en Mi cuenta.",
          code: "AI_LIMIT_EXCEEDED",
          used: creditResult?.used ?? 0,
          limit: creditResult?.limit ?? 0,
          remaining: creditResult?.remaining ?? 0,
        },
        { status: 429 },
      );
    }

    const tasksLimit = clampMaxTasks(body.maxTasks);
    const provider = getAIProvider();
    const rawResponse = await provider.generateTasks(prompt, tasksLimit);
    const sanitized = sanitizeTaskResponse(rawResponse);

    if (sanitized.tasks.length === 0) {
      return NextResponse.json(
        { error: "No se pudieron generar tareas válidas. Intentá de nuevo." },
        { status: 422 },
      );
    }

    return NextResponse.json({
      ...sanitized,
      credits: {
        used: creditResult.used,
        limit: creditResult.limit,
        remaining: creditResult.remaining,
      },
    });
  } catch (err: unknown) {
    console.error("[AI Tasks] Error:", err);
    const message =
      err instanceof Error ? err.message : "Error interno del servidor.";
    if (
      message.toLowerCase().includes("api key") ||
      message.toLowerCase().includes("unauthorized") ||
      message.includes("401")
    ) {
      return NextResponse.json(
        { error: "API Key de IA no configurada." },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}