"use client";

import { useMemo } from "react";
import type { ListsType, FolderType } from "@/lib/schemas/database.types";
import type { NormalizedItem } from "../utils/types";

/**
 * Orden lexicográfico por rank con desempate por id.
 * Usar id como tiebreaker hace el sort estable: dos ítems con el mismo rank
 * (o ambos null) siempre quedan en el mismo orden relativo, evitando que
 * al cargar la página 2 se reordenen los ya cargados visualmente.
 */
const byRank = (
  a: { rank?: string | null; id?: string },
  b: { rank?: string | null; id?: string }
) => {
  // Nulls van al final (mismo comportamiento que ORDER BY rank ASC NULLS LAST)
  const aNull = a.rank == null;
  const bNull = b.rank == null;
  if (aNull && bNull) return (a.id ?? "").localeCompare(b.id ?? "");
  if (aNull) return 1;
  if (bNull) return -1;
  if (a.rank! < b.rank!) return -1;
  if (a.rank! > b.rank!) return 1;
  // Desempate determinístico por id
  return (a.id ?? "").localeCompare(b.id ?? "");
};

export function useCombinedItems(lists: ListsType[], folders: FolderType[]) {
  const combinedItems = useMemo<NormalizedItem[]>(() => {
    const foldersNorm: NormalizedItem[] = (folders ?? []).map((f) => ({
      id: f.folder_id,
      kind: "folder" as const,
      data: f,
      // sort hijos por rank; usa list_id como tiebreaker para sort estable
      childrens: lists
        .filter((ls) => ls.folder === f.folder_id)
        .map((ls) => ({ ...ls, _sortId: ls.list_id }))
        .sort((a, b) => byRank({ rank: a.rank, id: a.list_id }, { rank: b.rank, id: b.list_id })),
      rank: (f as any).rank ?? null,
    }));

    const listsNorm: NormalizedItem[] = (lists ?? []).map((l) => ({
      id: l.list_id,
      kind: "list" as const,
      data: l,
      childrens: null,
      rank: (l as any).rank ?? null,
    }));

    // Ordenar por rank lexicográficamente con desempate por id
    return [...foldersNorm, ...listsNorm].sort(byRank);
  }, [lists, folders]);


  const topLevelItems = useMemo(
    () =>
      combinedItems.filter(
        (it) =>
          it.kind === "folder" ||
          (it.kind === "list" && (it.data as ListsType).folder == null),
      ),
    [combinedItems],
  );

  const combinedIds = useMemo(
    () =>
      topLevelItems
        .filter(
          (i) => !(i.kind === "list" && (i.data as ListsType).pinned === true),
        )
        .map((i) => i.id),
    [topLevelItems],
  );

  const pinnedLists = useMemo(
    () => (lists ?? []).filter((l) => l.pinned === true),
    [lists],
  );

  return { combinedItems, topLevelItems, combinedIds, pinnedLists };
}
