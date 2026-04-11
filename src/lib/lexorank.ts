"use client";

import { LexoRank } from "lexorank";
import type { ListsType, FolderType } from "@/lib/schemas/database.types";

export type CombinedKind = "list" | "folder";

export type NormalizedItem = {
  id: string;
  kind: CombinedKind;
  data: ListsType | FolderType;
  index: number;
};

export interface LexorankItem extends Omit<NormalizedItem, 'index'> {
  rank: string;
}

/**
 * Genera un rank inicial (primera inserción)
 */
export function getInitialRank(): string {
  return LexoRank.middle().toString();
}

/**
 * Calcula el nuevo rank para una posición en el array
 */
export function calcNewRank(arr: LexorankItem[], newIndex: number): string {
  const prev = arr[newIndex - 1]?.rank ?? null;
  const next = arr[newIndex + 1]?.rank ?? null;

  // Primera inserción
  if (prev === null && next === null) {
    return LexoRank.middle().toString();
  }

  // Insertar al inicio
  if (prev === null && next !== null) {
    const nextRank = tryParse(next);
    if (!nextRank) return LexoRank.middle().toString();
    return nextRank.genPrev().toString();
  }

  // Insertar al final
  if (next === null && prev !== null) {
    const prevRank = tryParse(prev);
    if (!prevRank) return LexoRank.middle().toString();
    return prevRank.genNext().toString();
  }

  // Insertar en el medio
  const prevRank = tryParse(prev!);
  const nextRank = tryParse(next!);
  if (!prevRank || !nextRank) return LexoRank.middle().toString();
  return prevRank.between(nextRank).toString();
}

/**
 * Calcula el rank para un nuevo item que se agrega al FINAL de la lista
 */
export function calcNewItemRank(items: LexorankItem[]): string {
  if (items.length === 0) {
    return LexoRank.middle().toString();
  }

  const lastItem = items[items.length - 1];
  const lastRank = tryParse(lastItem.rank);
  if (!lastRank) return LexoRank.middle().toString();
  return lastRank.genNext().toString();
}

/**
 * Calcula el rank combinado para múltiples listas
 */
export function calcNewItemRankFromMultipleLists(
  ...lists: LexorankItem[][]
): string {
  const allItems = lists.flat();

  if (allItems.length === 0) {
    return LexoRank.middle().toString();
  }

  // Solo considerar items con ranks válidos
  const validItems = allItems.filter((item) => tryParse(item.rank) !== null);

  if (validItems.length === 0) {
    return LexoRank.middle().toString();
  }

  const maxRank = validItems.reduce((max, item) => {
    const currentParsed = tryParse(item.rank)!;
    const maxParsed = tryParse(max)!;
    return currentParsed.compareTo(maxParsed) > 0 ? item.rank : max;
  }, validItems[0].rank);

  return tryParse(maxRank)!.genNext().toString();
}

/**
 * Intenta parsear un rank. Retorna null si el valor no es un LexoRank válido.
 * Esto protege contra ranks legacy, UUIDs, o valores corruptos en la DB.
 */
export function parseRank(rank: string): ReturnType<typeof LexoRank.parse> | null {
  try {
    return LexoRank.parse(rank);
  } catch {
    return null;
  }
}

/** Alias interno */
function tryParse(rank: string): ReturnType<typeof LexoRank.parse> | null {
  return parseRank(rank);
}

/**
 * Calcula nuevo rank considerando items con rank string o null.
 * Ignora silenciosamente cualquier rank que no sea un LexoRank válido.
 */
export function calculateNewRank(
  a: { rank: string | null }[] | null | undefined,
  b: { rank: string | null }[] | null | undefined
): string {
  const ranksA = (a ?? [])
    .map((item) => item.rank)
    .filter((rank): rank is string => rank !== null);

  const ranksB = (b ?? [])
    .map((item) => item.rank)
    .filter((rank): rank is string => rank !== null);

  // Solo mantenemos los ranks que LexoRank puede parsear correctamente
  const validRanks = [...ranksA, ...ranksB].filter(
    (rank) => tryParse(rank) !== null
  );

  if (validRanks.length === 0) {
    return LexoRank.middle().toString();
  }

  // Encontrar el rank máximo entre los válidos
  const maxRank = validRanks.reduce((max, current) => {
    const currentParsed = tryParse(current)!;
    const maxParsed = tryParse(max)!;
    return currentParsed.compareTo(maxParsed) > 0 ? current : max;
  });

  return tryParse(maxRank)!.genNext().toString();
}

/**
 * Genera el siguiente rank después del que se pasa como argumento.
 * Útil para crear ranks consecutivos en una inserción batch.
 */
export function calculateNextRankAfter(currentRank: string): string {
  const parsed = tryParse(currentRank);
  if (!parsed) return LexoRank.middle().toString();
  return parsed.genNext().toString();
}


/**
 * Rebalancea todos los ranks cuando sea necesario
 */
export function rebalanceRanks(items: LexorankItem[]): LexorankItem[] {
  if (items.length === 0) return items;
  
  const rebalanced: LexorankItem[] = [];
  let currentRank = LexoRank.min();
  
  // Generar ranks espaciados uniformemente
  for (let i = 0; i < items.length; i++) {
    if (i === 0) {
      currentRank = LexoRank.middle();
    } else {
      currentRank = currentRank.genNext();
    }
    
    rebalanced.push({
      ...items[i],
      rank: currentRank.toString()
    });
  }
  
  return rebalanced;
}

/**
 * Verifica si necesitas rebalancear (ranks muy largos)
 */
export function shouldRebalance(items: LexorankItem[], maxLength: number = 10): boolean {
  return items.some(item => item.rank.length > maxLength);
}

/**
 * Hook de ejemplo para reordenar items
 */
export function useReorder() {
  const reorderItem = async (
    items: LexorankItem[],
    fromIndex: number,
    toIndex: number
  ) => {
    const item = items[fromIndex];
    const reordered = [...items];
    reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, item);
    
    const newRank = calcNewRank(reordered, toIndex);
    
    // Actualizar en la base de datos
    // await supabase.from...
    
    return { ...item, rank: newRank };
  };
  
  return { reorderItem };
}

/**
 * Utilidad para convertir items con rank null a items con rank válido
 */
export function migrateItemsToLexorank<T extends { rank: string | null }>(
  items: T[]
): (T & { rank: string })[] {
  let currentRank = LexoRank.middle();
  
  return items.map((item, index) => {
    if (item.rank) {
      try {
        // Validar que el rank existente sea válido
        LexoRank.parse(item.rank);
        return item as T & { rank: string };
      } catch {
        // Si el rank no es válido, generar uno nuevo
      }
    }
    
    // Generar nuevo rank
    if (index === 0) {
      currentRank = LexoRank.middle();
    } else {
      currentRank = currentRank.genNext();
    }
    
    return {
      ...item,
      rank: currentRank.toString()
    };
  });
}