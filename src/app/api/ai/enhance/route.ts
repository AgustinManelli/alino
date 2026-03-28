import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/getProvider";
import { EnhanceAction } from "@/lib/ai/aiProvider";

export async function POST(req: NextRequest) {
  try {
    const { text, action } = (await req.json()) as {
      text: string;
      action: EnhanceAction;
    };

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "El texto no puede estar vacío." },
        { status: 400 },
      );
    }

    const validActions: EnhanceAction[] = [
      "improve",
      "summarize",
      "expand",
      "fix",
    ];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
    }

    const provider = getAIProvider();
    const result = await provider.enhance(text.trim(), action);

    return NextResponse.json({ result });
  } catch (err: unknown) {
    console.error("[AI Enhance] Error:", err);

    const message =
      err instanceof Error ? err.message : "Error interno del servidor.";

    // Error específico para API key no configurada
    if (
      message.toLowerCase().includes("api key") ||
      message.toLowerCase().includes("apikey") ||
      message.toLowerCase().includes("unauthorized") ||
      message.includes("401")
    ) {
      return NextResponse.json(
        { error: "API Key de IA no configurada. Añadila en .env.local." },
        { status: 401 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
