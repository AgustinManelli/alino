"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { resolveRegionalPrice, FormattedRegionalPrice } from "@/config/regionalPricing";

export interface CoinPack {
  id: string;
  code: string;
  name: string;
  coins_amount: number;
  regional_prices?: Record<string, { currency: string; amount: number }>;
  resolved_price?: FormattedRegionalPrice;
  tag: string | null;
  is_available: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface StreakPackage {
  id: string;
  code: string;
  name: string;
  protectors_count: number;
  coins_price: number;
  badge: string | null;
  is_active: boolean;
  sort_order: number;
}

import { AICreditPack } from "@/lib/schemas/database.types";

export interface ShopCatalogPayload {
  coin_packs: CoinPack[];
  streak_packages: StreakPackage[];
  ai_credit_packs?: AICreditPack[];
}

export interface RedeemResult {
  success: boolean;
  coins_added?: number;
  new_balance?: number;
  message?: string;
  error?: string;
  errorCode?: string;
}

export interface PurchaseResult {
  success: boolean;
  new_balance?: number;
  protectors_added?: number;
  purchased_protectors?: number;
  message?: string;
  error?: string;
  errorCode?: string;
}

const getAuth = cache(async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("No autenticado.");
  return { supabase, user: data.user };
});

export async function getUserCoinsAction(): Promise<{
  data?: number;
  error?: string;
}> {
  try {
    const { supabase, user } = await getAuth();
    const { data, error } = await supabase.rpc("get_user_coins", {
      p_user_id: user.id,
    });
    if (error) throw new Error(error.message);
    return { data: (data as number) ?? 0 };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al obtener monedas." };
  }
}

export async function getShopCatalogAction(): Promise<{
  data?: ShopCatalogPayload;
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    let countryCode = "AR";

    if (authData?.user) {
      const { data: priv } = await supabase
        .from("user_private")
        .select("country_code")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (priv?.country_code) {
        countryCode = priv.country_code;
      }
    }

    const { data, error } = await supabase.rpc("get_shop_catalog");
    if (error) throw new Error(error.message);
    const catalog = (data as ShopCatalogPayload) ?? { coin_packs: [], streak_packages: [] };

    const resolvedCoinPacks = catalog.coin_packs.map((pack) => ({
      ...pack,
      resolved_price: resolveRegionalPrice(pack.regional_prices, countryCode),
    }));

    return {
      data: {
        ...catalog,
        coin_packs: resolvedCoinPacks,
      },
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al obtener el catálogo." };
  }
}

export async function redeemPromoCodeAction(code: string): Promise<RedeemResult> {
  try {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.rpc("redeem_coin_promo_code", {
      p_code: code,
    });
    if (error) {
      const errCode = error.message || error.code || "GENERIC_ERROR";
      return {
        success: false,
        errorCode: errCode,
        error: errCode,
      };
    }
    const result = data as RedeemResult;
    return {
      success: true,
      coins_added: result.coins_added,
      new_balance: result.new_balance,
      message: result.message,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "GENERIC_ERROR";
    const errorCode = message === "No autenticado." ? "UNAUTHORIZED" : message;
    return {
      success: false,
      errorCode,
      error: errorCode,
    };
  }
}

export async function buyStreakPackageAction(packageId: string): Promise<PurchaseResult> {
  try {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.rpc("purchase_streak_protectors", {
      p_package_id: packageId,
    });
    if (error) {
      const code = error.message || error.code || "GENERIC_ERROR";
      return {
        success: false,
        errorCode: code,
        error: code,
      };
    }
    const result = data as PurchaseResult;
    return {
      success: true,
      new_balance: result.new_balance,
      protectors_added: result.protectors_added,
      purchased_protectors: result.purchased_protectors,
      message: result.message,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "GENERIC_ERROR";
    const errorCode = message === "No autenticado." ? "UNAUTHORIZED" : message;
    return {
      success: false,
      errorCode,
      error: errorCode,
    };
  }
}

export async function getShopAICreditPacksAction(): Promise<{
  data?: {
    packs: AICreditPack[];
    user_coins: number;
    extra_ai_credits: number;
  };
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    let userCoins = 0;
    let extraAICredits = 0;

    if (authData?.user) {
      const { data: privData } = await supabase
        .from("user_private")
        .select("alino_coins, extra_ai_credits")
        .eq("user_id", authData.user.id)
        .maybeSingle();
      userCoins = privData?.alino_coins ?? 0;
      extraAICredits = privData?.extra_ai_credits ?? 0;
    }

    const { data, error } = await supabase
      .from("shop_ai_credit_packs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);

    return {
      data: {
        packs: (data as AICreditPack[]) || [],
        user_coins: userCoins,
        extra_ai_credits: extraAICredits,
      },
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al obtener paquetes de créditos IA." };
  }
}

export async function buyAICreditsAction(packId: string): Promise<{
  success: boolean;
  new_coins?: number;
  credits_added?: number;
  new_extra_credits?: number;
  message?: string;
  error?: string;
  errorCode?: string;
}> {
  try {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.rpc("buy_ai_credits_with_coins", {
      p_pack_id: packId,
    });
    if (error) {
      const code = error.message || error.code || "GENERIC_ERROR";
      return {
        success: false,
        errorCode: code,
        error: code,
      };
    }
    const result = data as {
      success: boolean;
      new_coins: number;
      credits_added: number;
      new_extra_credits: number;
    };
    return {
      success: true,
      new_coins: result.new_coins,
      credits_added: result.credits_added,
      new_extra_credits: result.new_extra_credits,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "GENERIC_ERROR";
    const errorCode = message === "No autenticado." ? "UNAUTHORIZED" : message;
    return {
      success: false,
      errorCode,
      error: errorCode,
    };
  }
}

