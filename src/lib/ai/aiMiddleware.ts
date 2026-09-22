import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  AIFeatureKey,
  SubscriptionTier,
  hasAIFeatureAccess,
  getAIFeatureConfig,
} from "./permissions";
import { preCheckAICredits, deductAICredits } from "./credits";

export { preCheckAICredits, deductAICredits };

interface AuthSuccess {
  user: User;
  supabase: SupabaseClient;
  errorResponse?: never;
}

interface AuthFailure {
  user?: never;
  supabase?: never;
  errorResponse: NextResponse;
}

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

export interface FeatureAccessSuccess {
  allowed: true;
  tier: SubscriptionTier;
  errorResponse?: never;
}

export interface FeatureAccessFailure {
  allowed: false;
  tier: SubscriptionTier;
  errorResponse: NextResponse;
}

export type FeatureAccessResult = FeatureAccessSuccess | FeatureAccessFailure;

export async function checkAIFeatureAccess(
  supabase: SupabaseClient,
  userId: string,
  feature: AIFeatureKey
): Promise<FeatureAccessResult> {
  const { data: dbTier, error: tierError } = await supabase.rpc(
    "get_user_tier",
    { p_user_id: userId }
  );

  if (tierError) {
    console.error("[checkAIFeatureAccess] Error obteniendo tier desde DB:", tierError);
  }

  const currentTier = (dbTier || "free") as SubscriptionTier;
  const isAllowed = hasAIFeatureAccess(currentTier, feature);

  if (!isAllowed) {
    const config = getAIFeatureConfig(feature);
    return {
      allowed: false,
      tier: currentTier,
      errorResponse: NextResponse.json(
        {
          error:
            config.upgradeMessage ||
            "Esta funcionalidad de IA no está disponible en tu plan actual.",
          code: "TIER_INSUFFICIENT",
          feature,
          currentTier,
          requiredTiers: config.allowedTiers,
        },
        { status: 403 }
      ),
    };
  }

  return {
    allowed: true,
    tier: currentTier,
  };
}

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

  return null;
}
