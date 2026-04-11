import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

/** Resultado exitoso de autenticación */
interface AuthSuccess {
  user: User;
  supabase: SupabaseClient;
  errorResponse?: never;
}

/** Resultado fallido de autenticación */
interface AuthFailure {
  user?: never;
  supabase?: never;
  errorResponse: NextResponse;
}

/**
 * Verifica que el usuario esté autenticado y devuelve user + supabase client.
 * Si no está autenticado, devuelve un errorResponse listo para retornar.
 */
export async function getAuthenticatedUser(): Promise<AuthSuccess | AuthFailure> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      errorResponse: NextResponse.json(
        { error: "No autorizado. Iniciá sesión para continuar." },
        { status: 401 }
      ),
    };
  }

  return { user, supabase };
}

/**
 * Maneja errores de providers de IA de forma uniforme.
 */
export function handleAIError(err: unknown): NextResponse {
  console.error("[AI Route] Error:", err);
  const message = err instanceof Error ? err.message : "Error interno del servidor.";

  if (
    message.toLowerCase().includes("api key") ||
    message.toLowerCase().includes("apikey") ||
    message.toLowerCase().includes("unauthorized") ||
    message.includes("401")
  ) {
    return NextResponse.json(
      { error: "API Key de IA no configurada o inválida." },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { error: "Error interno del servidor de IA. Intentá nuevamente." },
    { status: 500 }
  );
}

/**
 * Procesa la respuesta de consume_feature_limit y retorna un error si no está permitido.
 */
export function handleCreditResult(creditResult: {
  allowed: boolean;
  reason?: string;
  used?: number;
  limit?: number;
  remaining?: number;
} | null): NextResponse | null {
  if (!creditResult) {
    return NextResponse.json({ error: "Error al verificar créditos." }, { status: 500 });
  }

  if (!creditResult.allowed) {
    if (creditResult.reason === "feature_not_available") {
      return NextResponse.json(
        {
          error: "Esta función de IA no está disponible en tu plan actual.",
          code: "FEATURE_NOT_AVAILABLE",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Alcanzaste tu límite de créditos IA este mes. Podés ver tu uso en Mi cuenta.",
        code: "AI_LIMIT_EXCEEDED",
        used: creditResult.used ?? 0,
        limit: creditResult.limit ?? 0,
        remaining: creditResult.remaining ?? 0,
      },
      { status: 429 }
    );
  }

  return null; // null = sin error, proceder
}
