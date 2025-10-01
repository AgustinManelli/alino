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
    const nextRank = LexoRank.parse(next);
    return nextRank.genPrev().toString();
  }
  
  // Insertar al final
  if (next === null && prev !== null) {
    const prevRank = LexoRank.parse(prev);
    return prevRank.genNext().toString();
  }
  
  // Insertar en el medio
  const prevRank = LexoRank.parse(prev!);
  const nextRank = LexoRank.parse(next!);
  return prevRank.between(nextRank).toString();
}

/**
 * Calcula el rank para un nuevo item que se agrega al FINAL de la lista
 */
export function calcNewItemRank(items: LexorankItem[]): string {
  if (items.length === 0) {
    return LexoRank.middle().toString();
  }
  
  // Obtener el último item y generar el siguiente rank
  const lastRank = LexoRank.parse(items[items.length - 1].rank);
  return lastRank.genNext().toString();
}

/**
 * Calcula el rank combinado para múltiples listas
 */
export function calcNewItemRankFromMultipleLists(
  ...lists: LexorankItem[][]
): string {
  // Combinar todas las listas
  const allItems = lists.flat();
  
  if (allItems.length === 0) {
    return LexoRank.middle().toString();
  }
  
  // Encontrar el rank máximo (último lexicográficamente)
  const maxRank = allItems.reduce((max, item) => {
    const currentRank = LexoRank.parse(item.rank);
    const maxRankParsed = LexoRank.parse(max);
    return currentRank.compareTo(maxRankParsed) > 0 ? item.rank : max;
  }, allItems[0].rank);
  
  const lastRank = LexoRank.parse(maxRank);
  return lastRank.genNext().toString();
}

/**
 * Calcula nuevo rank considerando items con rank string o null
 */
export function calculateNewRank(
  a: { rank: string | null }[] | null | undefined,
  b: { rank: string | null }[] | null | undefined
): string {
  // Extraer todos los ranks válidos (no-null)
  const ranksA = (a || [])
    .map(item => item.rank)
    .filter((rank): rank is string => rank !== null);
  
  const ranksB = (b || [])
    .map(item => item.rank)
    .filter((rank): rank is string => rank !== null);
  
  const allRanks = [...ranksA, ...ranksB];
  
  // Si no hay items con rank, retornar inicial
  if (allRanks.length === 0) {
    return LexoRank.middle().toString();
  }
  
  // Encontrar el rank máximo
  const maxRank = allRanks.reduce((max, current) => {
    const currentRank = LexoRank.parse(current);
    const maxRankParsed = LexoRank.parse(max);
    return currentRank.compareTo(maxRankParsed) > 0 ? current : max;
  });
  
  // Incrementar el rank máximo encontrado
  const lastRank = LexoRank.parse(maxRank);
  return lastRank.genNext().toString();
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