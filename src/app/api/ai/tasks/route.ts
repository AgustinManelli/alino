import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/getProvider";

export async function POST(req: NextRequest) {
  try {
    const { prompt, maxTasks } = (await req.json()) as {
      prompt: string;
      maxTasks: number;
    };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "El prompt no puede estar vacío." },
        { status: 400 },
      );
    }

    const clampedMax = Math.min(Math.max(Number(maxTasks) || 5, 1), 10);

    const provider = getAIProvider();
    const tasks = await provider.generateTasks(prompt.trim(), clampedMax);

    return NextResponse.json({ tasks });
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
        { error: "API Key de IA no configurada. Añadila en .env.local." },
        { status: 401 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
