/**
 * app/api/ai/enhance/route.ts
 */
import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/getProvider";
import { EnhanceAction } from "@/lib/ai/aiProvider";
import {
  sanitizeText,
  containsInjection,
  LIMITS,
} from "@/lib/ai/sanitize";

const VALID_ACTIONS = new Set<EnhanceAction>([
  "improve",
  "summarize",
  "expand",
  "fix",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Cuerpo de la solicitud inválido." },
        { status: 400 }
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
        { status: 400 }
      );
    }

    const text = sanitizeText(rawText, LIMITS.ENHANCE_TEXT_MAX);

    if (!text) {
      return NextResponse.json(
        { error: "El texto no puede estar vacío." },
        { status: 400 }
      );
    }

    if (containsInjection(text)) {
      return NextResponse.json(
        { error: "El texto contiene contenido no permitido." },
        { status: 422 }
      );
    }

    const provider = getAIProvider();
    const result = await provider.enhance(text, action);

    const sanitizedResult = sanitizeText(result, LIMITS.ENHANCE_TEXT_MAX);

    return NextResponse.json({ result: sanitizedResult });
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
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}