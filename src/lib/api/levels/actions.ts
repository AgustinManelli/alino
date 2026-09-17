"use server";

import { createClient } from "@/utils/supabase/server";
import { LevelItem } from "@/lib/schemas/database.types";

export async function getLevelsRoadmapAction(): Promise<{
  data?: LevelItem[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_levels_roadmap");
    if (error) throw new Error(error.message);
    return { data: (data as unknown as LevelItem[]) || [] };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "Error al obtener la hoja de ruta de niveles.",
    };
  }
}
