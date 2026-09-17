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
    let equippedOverlayId = userRes.data?.equipped_overlay_id ?? null;

    if (
      !isPro &&
      (equippedOverlayId === "overlay_pro_crown" || equippedOverlayId === "overlay_golden_crown")
    ) {
      equippedOverlayId = null;
      await supabase
        .from("users")
        .update({ equipped_overlay_id: null })
        .eq("user_id", user.id);
    }

    const inventoryCosmetics: CosmeticItem[] = (
      cosmeticsRes.data as unknown as CosmeticItem[]
    )
      .filter((cosmetic) => {
        if (cosmetic.id === "overlay_golden_crown" || cosmetic.code === "overlay_golden_crown") {
          return false;
        }
        if (cosmetic.id === "overlay_pro_crown" || cosmetic.code === "overlay_pro_crown") {
          return isPro;
        }
        if (cosmetic.tier_required === "pro") {
          return isPro;
        }
        return ownedIds.has(cosmetic.id);
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

export async function getShopCosmeticsCatalogAction(): Promise<{
  data?: {
    cosmetics: CosmeticItem[];
    user_coins: number;
  };
  error?: string;
}> {
  try {
    const { supabase, user } = await getAuth();

    const [cosmeticsRes, userCosmeticsRes, userRes] = await Promise.all([
      supabase
        .from("cosmetics")
        .select("*")
        .eq("is_for_sale", true)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("user_cosmetics")
        .select("cosmetic_id")
        .eq("user_id", user.id),
      supabase
        .from("users")
        .select("alino_coins")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (cosmeticsRes.error) throw new Error(cosmeticsRes.error.message);

    const ownedIds = new Set(
      (userCosmeticsRes.data || []).map((uc) => uc.cosmetic_id)
    );

    const items: CosmeticItem[] = (
      cosmeticsRes.data as unknown as CosmeticItem[]
    ).map((c) => ({
      ...c,
      is_unlocked: ownedIds.has(c.id),
      is_equipped: false,
    }));

    return {
      data: {
        cosmetics: items,
        user_coins: userRes.data?.alino_coins ?? 0,
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
}> {
  try {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.rpc("equip_cosmetic", {
      p_cosmetic_id: cosmeticId,
      p_type: type,
    });
    if (error) throw new Error(error.message);

    const result = data as {
      success: boolean;
      equipped_id: string | null;
    };

    return {
      success: true,
      equipped_id: result.equipped_id,
    };
  } catch (e) {
    return {
      success: false,
      equipped_id: null,
      error:
        e instanceof Error ? e.message : "Error al equipar el cosmético.",
    };
  }
}

export async function buyCosmeticAction(cosmeticId: string): Promise<{
  success: boolean;
  new_balance?: number;
  error?: string;
}> {
  try {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.rpc("buy_cosmetic_with_coins", {
      p_cosmetic_id: cosmeticId,
    });
    if (error) throw new Error(error.message);

    const result = data as {
      success: boolean;
      new_balance: number;
    };

    return {
      success: true,
      new_balance: result.new_balance,
    };
  } catch (e) {
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "Error al comprar el cosmético.",
    };
  }
}
