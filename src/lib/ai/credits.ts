import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TokenUsage } from "./gateway/types";
import {
  AI_FEATURE_KEY,
  calculateDynamicCredits,
} from "./creditCosts";

export interface CreditPreCheckResult {
  allowed: boolean;
  totalAvailable: number;
  remaining: number;
  extraRemaining: number;
  limit: number;
  isUnlimited: boolean;
  errorResponse?: NextResponse;
}

export interface CreditDeductionResult {
  allowed: boolean;
  creditCost: number;
  remainingCredits: number;
  reason?: string;
  errorResponse?: NextResponse;
}

export async function preCheckAICredits(
  supabase: SupabaseClient,
  userId: string
): Promise<CreditPreCheckResult> {
  try {
    const { data: usageData, error: usageError } = await supabase.rpc(
      "get_feature_usage",
      { p_feature_key: AI_FEATURE_KEY }
    );

    if (usageError || !usageData) {
      console.warn("[CreditManager] Error verificando créditos pre-ejecución:", usageError);
      return {
        allowed: true,
        totalAvailable: 1,
        remaining: 1,
        extraRemaining: 0,
        limit: 0,
        isUnlimited: false,
      };
    }

    const isUnlimited = (usageData.limit ?? 0) >= 9999999;
    const totalAvailable =
      (usageData.remaining ?? 0) + (usageData.extra_remaining ?? 0);

    if (!isUnlimited && totalAvailable <= 0) {
      return {
        allowed: false,
        totalAvailable: 0,
        remaining: usageData.remaining ?? 0,
        extraRemaining: usageData.extra_remaining ?? 0,
        limit: usageData.limit ?? 0,
        isUnlimited: false,
        errorResponse: NextResponse.json(
          {
            error:
              "Alcanzaste tu límite mensual de créditos de IA. Podés recargar más créditos en la Tienda o mejorar tu plan.",
            code: "AI_LIMIT_EXCEEDED",
            remaining: 0,
            limit: usageData.limit ?? 0,
          },
          { status: 429 }
        ),
      };
    }

    return {
      allowed: true,
      totalAvailable,
      remaining: usageData.remaining ?? 0,
      extraRemaining: usageData.extra_remaining ?? 0,
      limit: usageData.limit ?? 0,
      isUnlimited,
    };
  } catch (err) {
    console.error("[CreditManager] Error inesperado en preCheckAICredits:", err);
    return {
      allowed: true,
      totalAvailable: 1,
      remaining: 1,
      extraRemaining: 0,
      limit: 0,
      isUnlimited: false,
    };
  }
}

export async function deductAICredits(
  supabase: SupabaseClient,
  usage?: TokenUsage,
  fallbackCost: number = 1
): Promise<CreditDeductionResult> {
  const creditCost = calculateDynamicCredits(usage, fallbackCost);

  try {
    const { data: creditRes, error: creditError } = await supabase.rpc(
      "consume_feature_limit",
      {
        p_feature_key: AI_FEATURE_KEY,
        p_cost: creditCost,
      }
    );

    if (creditError || creditRes?.allowed === false) {
      const reason = creditRes?.reason || "monthly_limit_exceeded";
      const isFeatureNotAvailable = reason === "feature_not_available";

      console.warn(
        "[CreditManager] Consumo de créditos rechazado:",
        creditError || reason
      );

      const status = isFeatureNotAvailable ? 403 : 429;
      const code = isFeatureNotAvailable
        ? "FEATURE_NOT_AVAILABLE"
        : "AI_LIMIT_EXCEEDED";
      const message = isFeatureNotAvailable
        ? "Esta función de IA no está disponible en tu plan actual."
        : "Alcanzaste tu límite de créditos IA para este período. Podés ver tu uso en Mi cuenta o adquirir más créditos.";

      return {
        allowed: false,
        creditCost,
        remainingCredits: 0,
        reason,
        errorResponse: NextResponse.json(
          {
            error: message,
            code,
            used: creditRes?.used ?? 0,
            limit: creditRes?.limit ?? 0,
            remaining: 0,
          },
          { status }
        ),
      };
    }

    const totalRemaining =
      (creditRes?.remaining ?? 0) + (creditRes?.extra_remaining ?? 0);

    return {
      allowed: true,
      creditCost,
      remainingCredits: totalRemaining,
    };
  } catch (err) {
    console.error("[CreditManager] Error crítico ejecutando consume_feature_limit:", err);
    return {
      allowed: false,
      creditCost,
      remainingCredits: 0,
      reason: "internal_error",
      errorResponse: NextResponse.json(
        {
          error: "Error interno al procesar los créditos del usuario.",
          code: "CREDIT_DEDUCTION_FAILED",
        },
        { status: 500 }
      ),
    };
  }
}
