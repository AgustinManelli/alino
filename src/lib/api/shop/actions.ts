"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

export interface CoinPack {
  id: string;
  code: string;
  name: string;
  coins_amount: number;
  price_usd: number;
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
  format_type: "square" | "wide";
  badge: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface ShopCatalogPayload {
  coin_packs: CoinPack[];
  streak_packages: StreakPackage[];
}

export interface RedeemResult {
  success: boolean;
  coins_added?: number;
  new_balance?: number;
  message?: string;
  error?: string;
}

export interface PurchaseResult {
  success: boolean;
  new_balance?: number;
  protectors_added?: number;
  purchased_protectors?: number;
  message?: string;
  error?: string;
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
    const { data, error } = await supabase.rpc("get_shop_catalog");
    if (error) throw new Error(error.message);
    return { data: (data as ShopCatalogPayload) ?? { coin_packs: [], streak_packages: [] } };
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
    if (error) throw new Error(error.message);
    const result = data as RedeemResult;
    return {
      success: true,
      coins_added: result.coins_added,
      new_balance: result.new_balance,
      message: result.message,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al canjear el código.",
    };
  }
}

export async function buyStreakPackageAction(packageId: string): Promise<PurchaseResult> {
  try {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.rpc("purchase_streak_protectors", {
      p_package_id: packageId,
    });
    if (error) throw new Error(error.message);
    const result = data as PurchaseResult;
    return {
      success: true,
      new_balance: result.new_balance,
      protectors_added: result.protectors_added,
      purchased_protectors: result.purchased_protectors,
      message: result.message,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al comprar protectores.",
    };
  }
}
