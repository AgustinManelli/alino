"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";

export interface PromotionRedemptionData {
  success: boolean;
  code?: string;
  coins_added?: number;
  new_balance?: number;
  subscription_tier?: string;
  subscription_end_date?: string;
  benefits?: Array<{
    benefit_type: string;
    payload: Record<string, unknown>;
  }>;
  idempotent_replay?: boolean;
}

export interface PromotionRedemptionResult {
  success: boolean;
  data?: PromotionRedemptionData;
  error?: string;
  errorCode?: string;
}

export async function redeemPromotionAction(
  code: string,
): Promise<PromotionRedemptionResult> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    return {
      success: false,
      error: "CODE_REQUIRED",
      errorCode: "CODE_REQUIRED",
    };
  }

  try {
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return {
        success: false,
        error: "UNAUTHORIZED",
        errorCode: "UNAUTHORIZED",
      };
    }

    const { data, error } = await supabase.rpc("redeem_promotion", {
      p_code: normalizedCode,
      p_idempotency_key: randomUUID(),
    });
    if (error) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code || error.message,
      };
    }

    return {
      success: true,
      data: data as PromotionRedemptionData,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PROMOTION_REDEMPTION_FAILED";
    return {
      success: false,
      error: message,
      errorCode: message,
    };
  }
}
