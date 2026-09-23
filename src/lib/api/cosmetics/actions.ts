"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import {
  CosmeticItem,
  UserCosmeticsOverview,
} from "@/lib/schemas/database.types";
import { tierSatisfies } from "@/config/widgets.registry";

const getAuth = cache(async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("No autenticado.");
  return { supabase, user: data.user };
});

export async function getUserCosmeticsCatalogAction(): Promise<{
  data?: UserCosmeticsOverview;
  error?: string;
}> {
  try {
    const { supabase, user } = await getAuth();

    await supabase.rpc("sync_user_level_cosmetics", { p_user_id: user.id });

    const [userRes, cosmeticsRes, userCosmeticsRes, tierRes] = await Promise.all([
      supabase
        .from("users")
        .select("equipped_frame_id, equipped_overlay_id, level")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("cosmetics")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("user_cosmetics")
        .select("cosmetic_id")
        .eq("user_id", user.id),
      supabase.rpc("get_user_tier", { p_user_id: user.id }),
    ]);

    if (cosmeticsRes.error) throw new Error(cosmeticsRes.error.message);

    const userTier = (tierRes.data as string) ?? "free";
    const isPro = tierSatisfies(userTier, "pro");
    const ownedIds = new Set(
      (userCosmeticsRes.data || []).map((uc) => uc.cosmetic_id)
    );
    const equippedFrameId = userRes.data?.equipped_frame_id ?? null;
    const equippedOverlayId = userRes.data?.equipped_overlay_id ?? null;

    const allCosmetics = (cosmeticsRes.data || []) as unknown as CosmeticItem[];

    if (isPro) {
      await supabase.rpc("grant_user_pro_cosmetics", { p_user_id: user.id });
      allCosmetics.forEach((c) => {
        if (
          c.id === "overlay_pro_crown" ||
          c.code === "overlay_pro_crown" ||
          c.tier_required === "pro" ||
          c.tier_required === "ultra"
        ) {
          ownedIds.add(c.id);
        }
      });
    }

    const inventoryCosmetics: CosmeticItem[] = allCosmetics
      .filter((cosmetic) => {
        if (cosmetic.id === "overlay_golden_crown" || cosmetic.code === "overlay_golden_crown") {
          return false;
        }
        return (
          ownedIds.has(cosmetic.id) ||
          (isPro &&
            (cosmetic.id === "overlay_pro_crown" ||
              cosmetic.code === "overlay_pro_crown" ||
              cosmetic.tier_required === "pro" ||
              cosmetic.tier_required === "ultra"))
        );
      })
      .map((cosmetic) => {
        const isEquipped =
          cosmetic.type === "frame"
            ? equippedFrameId === cosmetic.id
            : equippedOverlayId === cosmetic.id;

        return {
          ...cosmetic,
          is_unlocked: true,
          is_equipped: isEquipped,
        };
      });

    return {
      data: {
        equipped_frame_id: equippedFrameId,
        equipped_overlay_id: equippedOverlayId,
        cosmetics: inventoryCosmetics,
      },
    };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "Error al obtener el catálogo de cosméticos.",
    };
  }
}

export async function getShopCosmeticsCatalogAction(params?: {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  data?: {
    cosmetics: CosmeticItem[];
    user_coins: number;
    total: number;
    page: number;
    total_pages: number;
  };
  error?: string;
}> {
  try {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.rpc("get_shop_cosmetics", {
      p_category: params?.category || "all",
      p_status: params?.status || "all",
      p_search: params?.search || "",
      p_page: params?.page || 1,
      p_page_size: params?.pageSize || 6,
    });

    if (error) throw new Error(error.message);

    const result = data as {
      items: CosmeticItem[];
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
      user_coins: number;
    };

    return {
      data: {
        cosmetics: result?.items || [],
        user_coins: result?.user_coins ?? 0,
        total: result?.total ?? 0,
        page: result?.page ?? 1,
        total_pages: result?.total_pages ?? 1,
      },
    };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "Error al obtener cosméticos de la tienda.",
    };
  }
}

export async function getLevelRewardsCatalogAction(): Promise<{
  data?: CosmeticItem[];
  error?: string;
}> {
  try {
    const { supabase } = await getAuth();

    const { data, error } = await supabase
      .from("cosmetics")
      .select("*")
      .eq("is_for_sale", false)
      .eq("is_active", true)
      .gt("min_level", 1)
      .order("min_level", { ascending: true });

    if (error) throw new Error(error.message);

    const items: CosmeticItem[] = (data as unknown as CosmeticItem[]).filter(
      (c) => !c.tier_required || c.tier_required === "free"
    );

    return { data: items };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "Error al obtener recompensas por nivel.",
    };
  }
}

export async function equipCosmeticAction(
  cosmeticId: string | null,
  type: "frame" | "overlay"
): Promise<{
  success: boolean;
  equipped_id: string | null;
  error?: string;
  errorCode?: string;
}> {
  try {
    const { supabase, user } = await getAuth();
    const { data, error } = await supabase.rpc("equip_cosmetic", {
      p_cosmetic_id: cosmeticId,
      p_type: type,
    });
    if (error) {
      if (error.message?.includes("TIER_REQUIRED_PRO") && cosmeticId) {
        const { data: ownCheck } = await supabase
          .from("user_cosmetics")
          .select("id")
          .eq("user_id", user.id)
          .eq("cosmetic_id", cosmeticId)
          .maybeSingle();

        if (ownCheck) {
          const updateField = type === "frame" ? "equipped_frame_id" : "equipped_overlay_id";
          await supabase
            .from("users")
            .update({ [updateField]: cosmeticId, updated_at: new Date().toISOString() })
            .eq("user_id", user.id);
          return { success: true, equipped_id: cosmeticId };
        }
      }
      const code = error.message || error.code || "GENERIC_ERROR";
      return {
        success: false,
        equipped_id: null,
        errorCode: code,
        error: code,
      };
    }

    const result = data as {
      success: boolean;
      equipped_id: string | null;
    };

    return {
      success: true,
      equipped_id: result.equipped_id,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "GENERIC_ERROR";
    const errorCode = message === "No autenticado." ? "UNAUTHORIZED" : message;
    return {
      success: false,
      equipped_id: null,
      errorCode,
      error: errorCode,
    };
  }
}

export async function buyCosmeticAction(cosmeticId: string): Promise<{
  success: boolean;
  new_balance?: number;
  error?: string;
  errorCode?: string;
}> {
  try {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.rpc("buy_cosmetic_with_coins", {
      p_cosmetic_id: cosmeticId,
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
      new_balance: number;
    };

    return {
      success: true,
      new_balance: result.new_balance,
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
