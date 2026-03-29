import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/getProvider";
import { createClient as createClientServer } from "@/utils/supabase/server";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticar al usuario que hace la petición
    const supabase = createClientServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para continuar." },
        { status: 401 }
      );
    }

    // 2. Verificar el nivel de suscripción usando la función SQL
    const { data: tier, error: tierError } = await supabase.rpc("get_user_tier", {
      p_user_id: user.id,
    });

    if (tierError) {
      console.error("Error obteniendo el tier:", tierError);
      return NextResponse.json(
        { error: "Error al verificar la suscripción." },
        { status: 500 }
      );
    }

    // La función SQL ya nos asegura que si nos devuelve 'pro' o 'student', es porque están activos
    const currentTier = tier || "free";
    const hasAccess = currentTier === "pro" || currentTier === "student";

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Acceso denegado. Esta funcionalidad requiere un plan Pro o Estudiante." },
        { status: 403 }
      );
    }

    // 3. Si pasó las validaciones, procedemos con la lógica de IA
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