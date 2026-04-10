import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/getProvider";
import { EnhanceAction } from "@/lib/ai/aiProvider";
import { sanitizeText, containsInjection, LIMITS } from "@/lib/ai/sanitize";
import { AI_FEATURE_KEY, AI_CREDIT_COSTS } from "@/lib/ai/creditCosts";
import { createClient as createClientServer } from "@/utils/supabase/server";

const VALID_ACTIONS = new Set<EnhanceAction>([
  "improve",
  "summarize",
  "expand",
  "fix",
]);

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

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Cuerpo de la solicitud inválido." },
        { status: 400 },
      );
    }

    const action = body.action as EnhanceAction;
    if (!VALID_ACTIONS.has(action)) {
      return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
    }

    const rawText = body.text;
    if (!rawText || typeof rawText !== "string") {
      return NextResponse.json(
        { error: "El texto no puede estar vacío." },
        { status: 400 },
      );
    }

    const text = sanitizeText(rawText, LIMITS.ENHANCE_TEXT_MAX);
    if (!text) {
      return NextResponse.json(
        { error: "El texto no puede estar vacío." },
        { status: 400 },
      );
    }

    if (containsInjection(text)) {
      return NextResponse.json(
        { error: "El texto contiene contenido no permitido." },
        { status: 422 },
      );
    }

    const cost = AI_CREDIT_COSTS.enhance;
    const { data: creditResult, error: creditError } = await supabase.rpc(
      "consume_feature_limit",
      {
        p_feature_key: AI_FEATURE_KEY,
        p_cost: cost,
      },
    );

    if (creditError) {
      console.error("[AI Enhance] Error consumiendo créditos:", creditError);
      return NextResponse.json(
        { error: "Error al verificar los créditos de IA." },
        { status: 500 },
      );
    }

    if (!creditResult?.allowed) {
      const reason = creditResult?.reason;
      if (reason === "feature_not_available") {
        return NextResponse.json(
          {
            error:
              "Esta función de IA no está disponible en tu plan actual.",
            code: "FEATURE_NOT_AVAILABLE",
          },
          { status: 403 },
        );
      }
      return NextResponse.json(
        {
          error: `Alcanzaste tu límite de créditos IA para este período. Te renuevan el ${
            creditResult?.remaining !== undefined
              ? ""
              : ""
          }. Podés ver tu uso en Mi cuenta.`,
          code: "AI_LIMIT_EXCEEDED",
          used: creditResult?.used ?? 0,
          limit: creditResult?.limit ?? 0,
          remaining: creditResult?.remaining ?? 0,
        },
        { status: 429 },
      );
    }

    const provider = getAIProvider();
    const result = await provider.enhance(text, action);
    const sanitizedResult = sanitizeText(result, LIMITS.ENHANCE_TEXT_MAX);

    return NextResponse.json({
      result: sanitizedResult,
      credits: {
        used: creditResult.used,
        limit: creditResult.limit,
        remaining: creditResult.remaining,
      },
    });
  } catch (err: unknown) {
    console.error("[AI Enhance] Error:", err);
    const message =
      err instanceof Error ? err.message : "Error interno del servidor.";
    if (
      message.toLowerCase().includes("api key") ||
      message.toLowerCase().includes("apikey") ||
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